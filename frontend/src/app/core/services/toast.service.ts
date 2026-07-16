import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastMsg { id: number; type: ToastType; text: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<ToastMsg[]>([]);
  private seq = 0;

  private show(type: ToastType, text: string): void {
    const id = ++this.seq;
    this.toasts.update((t) => [...t, { id, type, text }]);
    setTimeout(() => this.dismiss(id), 4200);
  }
  success(text: string): void { this.show('success', text); }
  error(text: string): void { this.show('error', text); }
  info(text: string): void { this.show('info', text); }
  dismiss(id: number): void { this.toasts.update((t) => t.filter((x) => x.id !== id)); }
}