import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente, ClienteInput } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);

  /** Logins de restaurante recebem apenas os proprios clientes (filtro e para o ADMIN). */
  listar(restauranteId?: number | null): Observable<Cliente[]> {
    let params = new HttpParams();
    if (restauranteId != null) { params = params.set('restauranteId', restauranteId); }
    return this.http.get<Cliente[]>('/api/clientes', { params });
  }

  criar(input: ClienteInput): Observable<Cliente> {
    return this.http.post<Cliente>('/api/clientes', input);
  }
}
