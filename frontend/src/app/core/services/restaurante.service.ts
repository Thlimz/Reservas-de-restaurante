import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Restaurante, RestauranteInput } from '../models/models';

@Injectable({ providedIn: 'root' })
export class RestauranteService {
  private http = inject(HttpClient);
  listar(): Observable<Restaurante[]> { return this.http.get<Restaurante[]>('/api/restaurantes'); }
  buscar(id: number): Observable<Restaurante> { return this.http.get<Restaurante>('/api/restaurantes/' + id); }
  criar(input: RestauranteInput): Observable<Restaurante> { return this.http.post<Restaurante>('/api/restaurantes', input); }
}