import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatbotStateService } from '../../../../../core/services/chatbot-state.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-customization',
  templateUrl: './customization.component.html',
  styleUrls: ['./customization.component.scss']
})
export class CustomizationComponent implements OnInit, OnDestroy {
  custForm!: FormGroup;
  private sub!: Subscription;
  private formSub!: Subscription;
  
  config$ = this.state.config$;

  colorPresets = [
    '#000000', '#3b82f6', '#10b981', '#f58c0b',
    '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'
  ];

  constructor(private fb: FormBuilder, private state: ChatbotStateService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.custForm = this.fb.group({
      color: ['#000000', Validators.required],
      welcome_message: ['Hello! How can I help you today?', Validators.required]
    });

    this.sub = this.state.config$.subscribe(config => {
      this.custForm.patchValue({
        color: config.color,
        welcome_message: config.welcome_message
      }, { emitEvent: false });
      this.state.setStepValidity(this.custForm.valid);
    });

    this.formSub = this.custForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(val => {
      this.state.setStepValidity(this.custForm.valid);
      if (this.custForm.valid) {
        this.state.updateConfig({
          color: val.color,
          welcome_message: val.welcome_message
        });
      }
    });
  }

  onPresetClick(color: string) {
    this.custForm.patchValue({ color });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const logo_preview = e.target.result;
        this.state.updateConfig({
          logo_file: file,
          logo_preview: logo_preview
        });
        // We trigger change detection here since the state update happens outside the form subscription
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.formSub) this.formSub.unsubscribe();
  }
}
