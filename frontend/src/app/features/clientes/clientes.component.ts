import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiError, Cliente } from '../../core/models/models';
import { ClienteService } from '../../core/services/cliente.service';
import { RestauranteAtivoService } from '../../core/services/restaurante-ativo.service';
import { ToastService } from '../../core/services/toast.service';
import { SpinnerComponent } from '../../shared/spinner.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, SpinnerComponent, EmptyStateComponent],
  templateUrl: './clientes.component.html',
})
export class ClientesComponent {
  private clienteSrv = inject(ClienteService);
  private restAtivo = inject(RestauranteAtivoService);
  private toast = inject(ToastService);

  protected clientes = signal<Cliente[]>([]);
  protected loading = signal(true);
  protected nome = '';
  protected telefone = '';
  protected email = '';
  protected erroNome = signal<string | null>(null);

  // recarrega ao trocar o restaurante ativo (untracked evita NG0600)
  constructor() { effect(() => { this.restAtivo.ativoId(); untracked(() => this.carregar()); }); }

  protected carregar(): void {
    this.loading.set(true);
    this.clienteSrv.listar(this.restAtivo.ativoId()).subscribe({
      next: (list) => { this.clientes.set([...list].sort((a, b) => a.nome.localeCompare(b.nome))); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  protected inicial(nome: string): string { return (nome.charAt(0) || '?').toUpperCase(); }
  protected contato(c: Cliente): string { return [c.telefone, c.email].filter(Boolean).join(' \u00b7 ') || '—'; }

  protected criar(): void {
    this.erroNome.set(null);
    if (!this.nome.trim()) { this.erroNome.set('Informe o nome'); return; }
    this.clienteSrv.criar({
      nome: this.nome.trim(), telefone: this.telefone, email: this.email,
      restauranteId: this.restAtivo.ativoId(),
    }).subscribe({
      next: () => { this.toast.success('Cliente ' + this.nome + ' cadastrado.'); this.nome = ''; this.telefone = ''; this.email = ''; this.carregar(); },
      error: (e: ApiError) => { if (e.camposInvalidos['nome']) { this.erroNome.set(e.camposInvalidos['nome']); } },
    });
  }
}