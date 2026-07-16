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
  protected usuario = '';
  protected senha = '';
  protected erros = signal<Record<string, string>>({});

  protected selecionar(r: Restaurante): void {
    this.restAtivo.setAtivo(r.id);
    this.toast.info('Restaurante ativo: ' + r.nome);
  }

  protected erro(campo: string): string | null { return this.erros()[campo] ?? null; }

  protected criar(): void {
    const pendentes: Record<string, string> = {};
    if (!this.nome.trim()) { pendentes['nome'] = 'Informe o nome'; }
    if (!this.usuario.trim()) { pendentes['usuario'] = 'Informe o usuário de acesso'; }
    if (this.senha.length < 6) { pendentes['senha'] = 'A senha deve ter no mínimo 6 caracteres'; }
    this.erros.set(pendentes);
    if (Object.keys(pendentes).length) { return; }

    this.restSrv.criar({
      nome: this.nome.trim(), endereco: this.endereco, telefone: this.telefone,
      usuario: this.usuario.trim(), senha: this.senha,
    }).subscribe({
      next: (novo) => {
        this.restAtivo.adicionar(novo);
        this.toast.success('Restaurante ' + novo.nome + ' criado com o login "' + this.usuario.trim() + '".');
        this.nome = ''; this.endereco = ''; this.telefone = ''; this.usuario = ''; this.senha = '';
      },
      error: (e: ApiError) => { this.erros.set(e.camposInvalidos ?? {}); },
    });
  }
}