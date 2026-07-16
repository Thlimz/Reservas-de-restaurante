import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiError, Restaurante } from '../../core/models/models';
import { RestauranteService } from '../../core/services/restaurante.service';
import { RestauranteAtivoService } from '../../core/services/restaurante-ativo.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-restaurantes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './restaurantes.component.html',
})
export class RestaurantesComponent {
  private restSrv = inject(RestauranteService);
  protected restAtivo = inject(RestauranteAtivoService);
  private toast = inject(ToastService);

  protected nome = '';
  protected endereco = '';
  protected telefone = '';
  protected erroNome = signal<string | null>(null);

  protected selecionar(r: Restaurante): void {
    this.restAtivo.setAtivo(r.id);
    this.toast.info('Restaurante ativo: ' + r.nome);
  }

  protected criar(): void {
    this.erroNome.set(null);
    if (!this.nome.trim()) { this.erroNome.set('Informe o nome'); return; }
    this.restSrv.criar({ nome: this.nome.trim(), endereco: this.endereco, telefone: this.telefone }).subscribe({
      next: (novo) => { this.restAtivo.adicionar(novo); this.toast.success('Restaurante ' + novo.nome + ' criado.'); this.nome = ''; this.endereco = ''; this.telefone = ''; },
      error: (e: ApiError) => { if (e.camposInvalidos['nome']) { this.erroNome.set(e.camposInvalidos['nome']); } },
    });
  }
}