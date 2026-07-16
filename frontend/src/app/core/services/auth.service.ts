import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Sessao } from '../models/models';

const CHAVE_SESSAO = 'mesahora.sessao';

function lerSessaoSalva(): Sessao | null {
  try {
    const raw = localStorage.getItem(CHAVE_SESSAO);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch {
    return null;
  }
}

/** Estado de autenticacao (token JWT + papel), persistido em localStorage. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly sessao = signal<Sessao | null>(lerSessaoSalva());
  readonly isAdmin = computed(() => this.sessao()?.papel === 'ADMIN');
  readonly logado = computed(() => this.sessao() !== null);

  login(username: string, senha: string): Observable<Sessao> {
    return this.http.post<Sessao>('/api/auth/login', { username, senha }).pipe(
      tap((s) => {
        localStorage.setItem(CHAVE_SESSAO, JSON.stringify(s));
        this.sessao.set(s);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(CHAVE_SESSAO);
    this.sessao.set(null);
    this.router.navigate(['/login']);
  }

  token(): string | null {
    return this.sessao()?.token ?? null;
  }
}
