import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty">
      <div style="font-family:var(--serif);font-size:19px;color:var(--text);margin-bottom:6px">{{ titulo() }}</div>
      <div style="font-size:14px">{{ descricao() }}</div>
    </div>`,
})
export class EmptyStateComponent {
  titulo = input('Nada por aqui');
  descricao = input('');
}