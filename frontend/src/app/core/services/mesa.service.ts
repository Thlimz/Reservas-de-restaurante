import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Mesa, MesaInput } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MesaService {
  private http = inject(HttpClient);
  listar(restauranteId: number): Observable<Mesa[]> {
    return this.http.get<Mesa[]>('/api/restaurantes/' + restauranteId + '/mesas');
  }
  criar(input: MesaInput): Observable<Mesa> { return this.http.post<Mesa>('/api/mesas', input); }
}