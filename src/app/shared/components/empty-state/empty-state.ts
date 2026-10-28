import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- ADD THIS

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.html',
  styleUrls: ['./empty-state.css']
})
export class EmptyStateComponent {
  @Input() icon = 'bi-inbox';
  @Input() title = 'No data found';
  @Input() message = 'Get started by creating a new record.';
}
