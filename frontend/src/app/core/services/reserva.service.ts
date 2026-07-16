import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Reserva, ReservaInput, StatusReserva } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private http = inject(HttpClient);

  listar(filtros?: { data?: string; status?: StatusReserva | ''; restauranteId?: number | null }): Observable<Reserva[]> {
    let params = new HttpParams();
    if (filtros?.data) { params = params.set('data', filtros.data); }
    if (filtros?.status) { params = params.set('status', filtros.status); }
    if (filtros?.restauranteId != null) { params = params.set('restauranteId', filtros.restauranteId); }
    return this.http.get<Reserva[]>('/api/reservas', { params });
  }
  buscar(id: number): Observable<Reserva> { return this.http.get<Reserva>('/api/reservas/' + id); }
  criar(input: ReservaInput): Observable<Reserva> { return this.http.post<Reserva>('/api/reservas', input); }
  atualizarStatus(id: number, status: StatusReserva): Observable<Reserva> {
    return this.http.patch<Reserva>('/api/reservas/' + id, { status });
  }
}