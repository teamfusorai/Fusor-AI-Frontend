import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  userName: string = 'User';
  userInitials: string = 'U';

  ngOnInit() {
    const storedName = localStorage.getItem('name');
    if (storedName) {
      this.userName = storedName;
      this.userInitials = this.getInitials(storedName);
    }
  }

  private getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}

