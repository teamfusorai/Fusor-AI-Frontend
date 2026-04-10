import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { FusorInputComponent } from './components/fusor-input/fusor-input.component';
import { FusorButtonComponent } from './components/fusor-button/fusor-button.component';
import { FusorDropdownComponent } from './components/fusor-dropdown/fusor-dropdown.component';
const COMPONENTS = [
  FusorInputComponent,
  FusorButtonComponent,
  FusorDropdownComponent
];

@NgModule({
  declarations: [...COMPONENTS],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    DropdownModule
  ],
  exports: [
    ...COMPONENTS,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule
  ]
})
export class SharedMModule { }
