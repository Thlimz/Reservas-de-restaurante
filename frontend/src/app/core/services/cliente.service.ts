import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente, ClienteInput } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private http = inject(HttpClient);
  listar(): Observable<Cliente[]> { return this.http.get<Cliente[]>('/api/clientes'); }
  criar(input: ClienteInput): Observable<Cliente> { return this.http.post<Cliente>('/api/clientes', input); }
}