import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { ConfirmService } from '../../../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialog {
  confirm = inject(ConfirmService);

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.confirm.state()) this.confirm.answer(false);
  }
}