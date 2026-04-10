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
  @Input() optionLabel: string = 'label';
  @Input() optionValue: string = 'value';
  @Input() placeholder: string = 'Select an option';
  @Input() disabled: boolean = false;
  @Input() errorMessage: string = '';
  @Input() showRequiredStar: boolean = false;

  value: any = null;

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(val: any): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onModelChange(event: any) {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
