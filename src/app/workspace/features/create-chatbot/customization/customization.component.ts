import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatbotWizardService } from '../services/chatbot-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-customization',
  templateUrl: './customization.component.html',
  styleUrls: ['./customization.component.scss']
})
export class CustomizationComponent implements OnInit, OnDestroy {
  customizationForm!: FormGroup;
  private sub: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private wizardService: ChatbotWizardService
  ) {}

  ngOnInit(): void {
    const initialState = this.wizardService.currentState.customization;

    this.customizationForm = this.fb.group({
      primaryColor: [initialState.primaryColor, Validators.required],
      logoUrl: [initialState.logoUrl],
      welcomeMessage: [initialState.welcomeMessage, Validators.required]
    });

    this.sub.add(
      this.customizationForm.statusChanges.subscribe(status => {
        this.wizardService.setCurrentStepValidity(status === 'VALID');
      })
    );

    this.sub.add(
      this.customizationForm.valueChanges.subscribe(val => {
        this.wizardService.updateCustomization(val);
      })
    );

    this.wizardService.setCurrentStepValidity(this.customizationForm.valid);
  }

  onLogoUpload(event: any) {
    const file = event.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      this.customizationForm.patchValue({ logoUrl: url });
      this.customizationForm.markAsDirty();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
