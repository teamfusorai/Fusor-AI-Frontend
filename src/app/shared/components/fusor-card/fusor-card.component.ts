import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-fusor-card',
  templateUrl: './fusor-card.component.html',
  styleUrls: ['./fusor-card.component.scss']
})
export class FusorCardComponent {
  @Input() hoverable: boolean = false;
}
