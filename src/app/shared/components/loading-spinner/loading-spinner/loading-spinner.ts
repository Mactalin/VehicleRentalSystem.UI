import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.html',
  styleUrl: './loading-spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinner {
  message = input<string>('Loading...');
  overlay = input<boolean>(false);   // true = covers the parent (parent needs position: relative)
}