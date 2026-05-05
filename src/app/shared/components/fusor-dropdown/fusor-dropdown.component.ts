import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-fusor-dropdown',
  templateUrl: './fusor-dropdown.component.html',
  styleUrls: ['./fusor-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FusorDropdownComponent),
      multi: true
    }
  ]
})
export class FusorDropdownComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() options: any[] = [];
  @Input() placeholder: string = '';
  @Input() showRequiredStar: boolean = false;
  @Input() disabled: boolean = false;
  @Input() errorMessage: string = '';

  value: any = null;
  isFocused: boolean = false;

  onChange = (val: any) => {};
  onTouched = () => {};

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

  onModelChange(val: any) {
    this.value = val;
    this.onChange(val);
  }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
    this.onTouched();
  }
}
