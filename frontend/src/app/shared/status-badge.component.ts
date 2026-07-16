import { Component, computed, input } from '@angular/core';
import { StatusReserva } from '../core/models/models';

const META: Record<StatusReserva, { label: string; dot: string; cls: string }> = {
  AGENDADA:   { label: 'Agendada',   dot: '\u25CB', cls: 'badge-agendada' },
  CONFIRMADA: { label: 'Confirmada', dot: '\u25CF', cls: 'badge-confirmada' },
  FINALIZADA: { label: 'Finalizada', dot: '\u2713', cls: 'badge-finalizada' },
  CANCELADA:  { label: 'Cancelada',  dot: '\u2715', cls: 'badge-cancelada' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge {{ meta().cls }}"><span aria-hidden="true">{{ meta().dot }}</span>{{ meta().label }}</span>`,
})
export class StatusBadgeComponent {
  status = input.required<StatusReserva>();
  protected meta = computed(() => META[this.status()]);
}