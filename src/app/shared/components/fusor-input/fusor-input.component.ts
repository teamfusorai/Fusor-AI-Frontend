import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, NgControl } from '@angular/forms';

@Component({
  selector: 'app-fusor-input',
  templateUrl: './fusor-input.component.html',
  styleUrls: ['./fusor-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FusorInputComponent),
      multi: true
    }
  ]
})
export class FusorInputComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() placeholder: string = '';
  @Input() icon: string = ''; // PrimeIcons class e.g. 'pi pi-user'
  @Input() disabled: boolean = false;
  @Input() showRequiredStar: boolean = false;
  @Input() multiline: boolean = false;
  @Input() rows: number = 4;
  
  // To show error messages manually if desired, but mostly we handle it via the bounded control state
  @Input() errorMessage: string = ''; 
  
  // State
  value: any = '';
  isPasswordVisible: boolean = false;
  isFocused: boolean = false;

  // CVA routines
  onChange = (val: any) => {};
  onTouched = () => {};

  constructor() {}

  ngOnInit(): void {}

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.value = value;
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Internal Logic
  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val);
  }

  onFocus(): void {
    this.isFocused = true;
  }

  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  get computedType(): string {
    if (this.type === 'password') {
      return this.isPasswordVisible ? 'text' : 'password';
    }
    return this.type;
  }
}
