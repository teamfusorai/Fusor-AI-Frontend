import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatbotWizardService } from '../services/chatbot-wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss']
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  basicInfoForm!: FormGroup;
  private sub: Subscription = new Subscription();

  industryOptions = [
    { label: 'E-commerce', value: 'E-commerce' },
    { label: 'Healthcare', value: 'Healthcare' },
    { label: 'Real Estate', value: 'Real Estate' },
    { label: 'Customer Support', value: 'Customer Support' },
    { label: 'Other', value: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private wizardService: ChatbotWizardService
  ) {}

  ngOnInit(): void {
    const initialState = this.wizardService.currentState.basicInfo;

    this.basicInfoForm = this.fb.group({
      name: [initialState.name, Validators.required],
      industry: [initialState.industry, Validators.required],
      customIndustry: [initialState.customIndustry || '']
    });

    this.basicInfoForm.get('industry')?.valueChanges.subscribe(val => {
      const customCtrl = this.basicInfoForm.get('customIndustry');
      if (val === 'Other') {
        customCtrl?.setValidators([Validators.required]);
      } else {
        customCtrl?.clearValidators();
        customCtrl?.setValue('');
      }
      customCtrl?.updateValueAndValidity();
    });

    this.sub.add(
      this.basicInfoForm.statusChanges.subscribe(status => {
        this.wizardService.setCurrentStepValidity(status === 'VALID');
      })
    );

    this.sub.add(
      this.basicInfoForm.valueChanges.subscribe(val => {
        this.wizardService.updateBasicInfo(val);
      })
    );

    this.wizardService.setCurrentStepValidity(this.basicInfoForm.valid);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
