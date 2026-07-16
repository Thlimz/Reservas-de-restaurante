import { Injectable, computed, inject, signal } from '@angular/core';
import { Restaurante } from '../models/models';
import { RestauranteService } from './restaurante.service';

/** Estado compartilhado do restaurante ativo (via signals). */
@Injectable({ providedIn: 'root' })
export class RestauranteAtivoService {
  private restauranteSrv = inject(RestauranteService);
  readonly restaurantes = signal<Restaurante[]>([]);
  readonly ativoId = signal<number | null>(null);
  readonly ativo = computed<Restaurante | null>(
    () => this.restaurantes().find((r) => r.id === this.ativoId()) ?? null,
  );

  /** ADMIN: carrega a lista completa e mantem o seletor global. */
  carregar(): void {
    this.restauranteSrv.listar().subscribe((list) => {
      this.restaurantes.set(list);
      if (this.ativoId() == null && list.length > 0) { this.ativoId.set(list[0].id); }
    });
  }

  /** Login de RESTAURANTE: contexto fixo no proprio restaurante (sem seletor). */
  definirFixo(id: number, nome: string): void {
    this.restaurantes.set([{ id, nome, endereco: '', telefone: '' }]);
    this.ativoId.set(id);
  }

  /** Limpa o estado ao encerrar a sessao. */
  limpar(): void {
    this.restaurantes.set([]);
    this.ativoId.set(null);
  }
  setAtivo(id: number): void { this.ativoId.set(id); }
  adicionar(r: Restaurante): void {
    this.restaurantes.update((l) => [...l, r]);
    if (this.ativoId() == null) { this.ativoId.set(r.id); }
  }
}