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

  carregar(): void {
    this.restauranteSrv.listar().subscribe((list) => {
      this.restaurantes.set(list);
      if (this.ativoId() == null && list.length > 0) { this.ativoId.set(list[0].id); }
    });
  }
  setAtivo(id: number): void { this.ativoId.set(id); }
  adicionar(r: Restaurante): void {
    this.restaurantes.update((l) => [...l, r]);
    if (this.ativoId() == null) { this.ativoId.set(r.id); }
  }
}