import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ChatbotStateService } from '../../../../../core/services/chatbot-state.service';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  infoForm!: FormGroup;
  private sub!: Subscription;
  private formSub!: Subscription;
  private statusSub!: Subscription;

  industryOptions = [
    { label: 'E-Commerce', value: 'E-Commerce' },
    { label: 'SaaS / Software', value: 'SaaS / Software' },
    { label: 'Healthcare & Medical', value: 'Healthcare & Medical' },
    { label: 'Finance & Banking', value: 'Finance & Banking' },
    { label: 'Real Estate & Property', value: 'Real Estate & Property' },
    { label: 'Education & EdTech', value: 'Education & EdTech' },
    { label: 'Travel & Hospitality', value: 'Travel & Hospitality' },
    { label: 'Retail & Consumer Goods', value: 'Retail & Consumer Goods' },
    { label: 'Manufacturing & Logistics', value: 'Manufacturing & Logistics' },
    { label: 'Legal Services', value: 'Legal Services' },
    { label: 'Non-profit & Charity', value: 'Non-profit & Charity' },
    { label: 'Media & Entertainment', value: 'Media & Entertainment' },
    { label: 'Other', value: 'Other' }
  ];

  constructor(private fb: FormBuilder, private state: ChatbotStateService) {}

  ngOnInit() {
    this.infoForm = this.fb.group({
      chatbot_name: ['', Validators.required],
      description: [''],
      industry: ['', Validators.required]
    });

    this.sub = this.state.config$.subscribe(config => {
      this.infoForm.patchValue({
        chatbot_name: config.chatbot_name,
        description: config.description,
        industry: config.industry
      }, { emitEvent: false });
      this.state.setStepValidity(this.infoForm.valid);
    });

    this.statusSub = this.infoForm.statusChanges.subscribe(() => {
      this.state.setStepValidity(this.infoForm.valid);
    });

    this.formSub = this.infoForm.valueChanges.pipe(debounceTime(300)).subscribe(val => {
      if (this.infoForm.valid) {
        this.state.updateConfig({
          chatbot_name: val.chatbot_name,
          description: val.description,
          industry: val.industry
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.formSub) this.formSub.unsubscribe();
    if (this.statusSub) this.statusSub.unsubscribe();
  }
}
