import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayout {
  features = [
    'Real-time fleet availability',
    'Transparent hourly, daily and weekly pricing',
    'Insurance and registration expiry alerts',
    'Branch-wise vehicle and maintenance tracking'
  ];
}