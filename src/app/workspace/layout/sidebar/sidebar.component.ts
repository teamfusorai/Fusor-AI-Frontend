import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() isMobileVisible: boolean = false;
  @Output() isMobileVisibleChange = new EventEmitter<boolean>();

  userName: string = 'User';
  userEmail: string = '';

  ngOnInit(): void {
    this.userName = localStorage.getItem('name') || 'User';
    this.userEmail = localStorage.getItem('email') || '';
  }

  closeMobileMenu() {
    if (this.isMobileVisible) {
      this.isMobileVisible = false;
      this.isMobileVisibleChange.emit(false);
    }
  }
}
