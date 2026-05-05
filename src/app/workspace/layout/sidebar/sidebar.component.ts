import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isMobileVisible: boolean = false;
  @Output() isMobileVisibleChange = new EventEmitter<boolean>();

  closeMobileMenu() {
    if (this.isMobileVisible) {
      this.isMobileVisible = false;
      this.isMobileVisibleChange.emit(false);
    }
  }
}
