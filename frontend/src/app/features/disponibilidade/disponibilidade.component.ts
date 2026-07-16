import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Disponibilidade } from '../../core/models/models';
import { DisponibilidadeService } from '../../core/services/disponibilidade.service';
import { RestauranteAtivoService } from '../../core/services/restaurante-ativo.service';
import { ToastService } from '../../core/services/toast.service';
import { SpinnerComponent } from '../../shared/spinner.component';
import { formatDateBr, isoToday } from '../../core/util/format';

interface Consulta { data: string; inicio: string; fim: string; }

@Component({
  selector: 'app-disponibilidade',
  standalone: true,
  imports: [FormsModule, SpinnerComponent],
  templateUrl: './disponibilidade.component.html',
})
export class DisponibilidadeComponent {
  private dispSrv = inject(DisponibilidadeService);
  private restAtivo = inject(RestauranteAtivoService);
  private toast = inject(ToastService);
  private router = inject(Router);
  protected readonly formatDateBr = formatDateBr;

  protected data = isoToday();
  protected inicio = '19:00';
  protected fim = '21:00';
  protected pessoas = 2;

  protected loading = signal(false);
  protected resultado = signal<Disponibilidade[] | null>(null);
  protected consulta = signal<Consulta | null>(null);

  constructor() {
    // limpa o resultado ao trocar de restaurante
    effect(() => { this.restAtivo.ativoId(); this.resultado.set(null); this.consulta.set(null); });
  }

  protected verificar(): void {
    const id = this.restAtivo.ativoId();
    if (id == null) { this.toast.error('Selecione um restaurante.'); return; }
    if (this.fim <= this.inicio) { this.toast.error('A hora final deve ser após a inicial.'); return; }
    this.loading.set(true);
    this.resultado.set(null);
    this.dispSrv.consultar(id, this.data, this.inicio, this.fim).subscribe({
      next: (list) => {
        this.resultado.set(list);
        this.consulta.set({ data: this.data, inicio: this.inicio, fim: this.fim });
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected livres(): number { return (this.resultado() ?? []).filter((m) => m.disponivel).length; }
  protected capacidadeOk(m: Disponibilidade): boolean { return m.capacidade >= (this.pessoas || 0); }
  protected reservavel(m: Disponibilidade): boolean { return m.disponivel && this.capacidadeOk(m); }
  protected tipoLabel(m: Disponibilidade): string { return m.tipo === 'SALA' ? 'Sala privativa' : 'Mesa'; }

  protected estado(m: Disponibilidade): { label: string; badgeBg: string; badgeFg: string; border: string; bg: string } {
    if (m.disponivel) {
      return { label: 'LIVRE', badgeBg: 'color-mix(in oklab,var(--ok) 16%,transparent)', badgeFg: 'var(--ok)', border: 'color-mix(in oklab,var(--ok) 45%,var(--border))', bg: 'color-mix(in oklab,var(--ok) 7%,var(--surface))' };
    }
    return { label: 'OCUPADA', badgeBg: 'color-mix(in oklab,var(--danger) 15%,transparent)', badgeFg: 'var(--danger)', border: 'var(--border)', bg: 'var(--surface)' };
  }

  protected reservar(m: Disponibilidade): void {
    const c = this.consulta();
    if (!c || !this.reservavel(m)) { return; }
    this.router.navigate(['/reservas'], {
      queryParams: { mesaId: m.mesaId, data: c.data, inicio: c.inicio, fim: c.fim, pessoas: this.pessoas },
    });
    this.toast.info('Mesa ' + m.numero + ' pré-selecionada. Escolha o cliente e confirme.');
  }
}