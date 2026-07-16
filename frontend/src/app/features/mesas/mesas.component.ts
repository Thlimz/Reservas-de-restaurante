import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiError, Mesa, TipoMesa } from '../../core/models/models';
import { MesaService } from '../../core/services/mesa.service';
import { RestauranteAtivoService } from '../../core/services/restaurante-ativo.service';
import { ToastService } from '../../core/services/toast.service';
import { SpinnerComponent } from '../../shared/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [FormsModule, SpinnerComponent, EmptyStateComponent],
  templateUrl: './mesas.component.html',
})
export class MesasComponent {
  private mesaSrv = inject(MesaService);
  protected restAtivo = inject(RestauranteAtivoService);
  private toast = inject(ToastService);

  protected mesas = signal<Mesa[]>([]);
  protected loading = signal(true);

  protected numero: number | null = null;
  protected capacidade = 4;
  protected tipo: TipoMesa = 'MESA';
  protected ativo = true;
  protected erroNumero = signal<string | null>(null);

  // untracked: escrever em signal dentro de effect lanca NG0600 no Angular 18
  constructor() { effect(() => { this.restAtivo.ativoId(); untracked(() => this.carregar()); }); }

  protected carregar(): void {
    const id = this.restAtivo.ativoId();
    if (id == null) { return; }
    this.loading.set(true);
    this.mesaSrv.listar(id).subscribe({
      next: (list) => { this.mesas.set([...list].sort((a, b) => a.numero - b.numero)); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected criar(): void {
    const id = this.restAtivo.ativoId();
    if (id == null) { this.toast.error('Selecione um restaurante.'); return; }
    this.erroNumero.set(null);
    if (this.numero == null) { this.erroNumero.set('Informe o número'); return; }
    this.mesaSrv
      .criar({ restauranteId: id, numero: this.numero, capacidade: this.capacidade, tipo: this.tipo, ativo: this.ativo })
      .subscribe({
        next: () => { this.toast.success('Mesa ' + this.numero + ' cadastrada.'); this.numero = null; this.capacidade = 4; this.tipo = 'MESA'; this.ativo = true; this.carregar(); },
        error: (e: ApiError) => { if (e.camposInvalidos['numero']) { this.erroNumero.set(e.camposInvalidos['numero']); } },
      });
  }
}