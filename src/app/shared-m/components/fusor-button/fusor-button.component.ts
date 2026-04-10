import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fusor-button',
  templateUrl: './fusor-button.component.html',
  styleUrls: ['./fusor-button.component.scss']
})
export class FusorButtonComponent {
  @Input() label: string = '';
  @Input() type: 'submit' | 'button' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'text' = 'primary';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() icon: string = '';
  @Input() fullWidth: boolean = true;
  
  @Output() onClick = new EventEmitter<Event>();
}
