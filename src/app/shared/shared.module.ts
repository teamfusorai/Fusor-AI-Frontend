import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SliderModule } from 'primeng/slider';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { FusorInputComponent } from './components/fusor-input/fusor-input.component';
import { FusorButtonComponent } from './components/fusor-button/fusor-button.component';
import { FusorDropdownComponent } from './components/fusor-dropdown/fusor-dropdown.component';
import { ChatbotPreviewComponent } from './components/chatbot-preview/chatbot-preview.component';
import { FusorCopyInputComponent } from './components/fusor-copy-input/fusor-copy-input.component';
import { FusorCardComponent } from './components/fusor-card/fusor-card.component';
import { DeploymentOptionsComponent } from './components/deployment-options/deployment-options.component';

const COMPONENTS = [
  FusorInputComponent,
  FusorButtonComponent,
  FusorDropdownComponent,
  ChatbotPreviewComponent,
  FusorCopyInputComponent,
  FusorCardComponent,
  DeploymentOptionsComponent
];

const PRIMENG_MODULES = [
  DividerModule,
  ButtonModule,
  InputTextModule,
  InputTextareaModule,
  DropdownModule,
  CardModule,
  ToastModule,
  ProgressBarModule,
  RippleModule,
  ColorPickerModule,
  SliderModule,
  MenuModule,
  ConfirmDialogModule,
  SkeletonModule,
  BadgeModule,
  ProgressSpinnerModule
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ClipboardModule,
    ...PRIMENG_MODULES
  ],
  exports: [
    ...PRIMENG_MODULES,
    ...COMPONENTS,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule
  ]
})
export class SharedModule { }
