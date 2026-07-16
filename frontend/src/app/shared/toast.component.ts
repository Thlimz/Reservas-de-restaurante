import { Component, inject } from '@angular/core';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div aria-live="polite"
         style="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none">
      @for (t of toastSrv.toasts(); track t.id) {
        <div role="status" (click)="toastSrv.dismiss(t.id)"
             [style.background]="bg(t.type)"
             style="pointer-events:auto;cursor:pointer;display:flex;align-items:center;gap:11px;padding:13px 18px;border-radius:12px;color:#fff;box-shadow:0 12px 30px -10px rgba(0,0,0,.45);font-size:13.5px;font-weight:600;animation:toastIn .28s ease;max-width:min(90vw,460px)">
          <span aria-hidden="true" style="font-size:15px">{{ glyph(t.type) }}</span>
          <span>{{ t.text }}</span>
        </div>
      }
    </div>`,
})
export class ToastComponent {
  protected toastSrv = inject(ToastService);
  protected bg(type: string): string {
    return type === 'error' ? 'var(--danger)' : type === 'success' ? 'var(--ok)' : '#3b3531';
  }
  protected glyph(type: string): string {
    return type === 'error' ? '\u26A0' : type === 'success' ? '\u2713' : '\u2139';
  }
}