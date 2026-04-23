import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';

import { FusorInputComponent } from './components/fusor-input/fusor-input.component';
import { FusorButtonComponent } from './components/fusor-button/fusor-button.component';
import { FusorDropdownComponent } from './components/fusor-dropdown/fusor-dropdown.component';

const COMPONENTS = [
  FusorInputComponent,
  FusorButtonComponent,
  FusorDropdownComponent
];

const PRIMENG_MODULES = [
  DividerModule,
  ButtonModule,
  InputTextModule,
  CardModule,
  ToastModule,
  ProgressBarModule,
  RippleModule
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ...PRIMENG_MODULES
  ],
  exports: [
    ...PRIMENG_MODULES,
    ...COMPONENTS,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
