import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- ADD THIS

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-header.html',
  styleUrls: ['./page-header.css']
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
