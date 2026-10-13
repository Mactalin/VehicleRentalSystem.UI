import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  tone?: 'danger' | 'primary';
}

interface ConfirmState extends Required<ConfirmOptions> {
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private _state = signal<ConfirmState | null>(null);
  readonly state = this._state.asReadonly();

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._state.set({
        title: 'Are you sure?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        tone: 'danger',
        ...options,
        resolve
      });
    });
  }

  answer(result: boolean) {
    const current = this._state();
    this._state.set(null);
    current?.resolve(result);
  }
}