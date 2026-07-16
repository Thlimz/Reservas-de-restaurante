import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Disponibilidade } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DisponibilidadeService {
  private http = inject(HttpClient);
  consultar(restauranteId: number, data: string, inicio: string, fim: string): Observable<Disponibilidade[]> {
    const params = new HttpParams().set('data', data).set('inicio', inicio).set('fim', fim);
    return this.http.get<Disponibilidade[]>('/api/restaurantes/' + restauranteId + '/disponibilidade', { params });
  }
}