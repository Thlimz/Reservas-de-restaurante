import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Anexa "Authorization: Bearer <token>" nas chamadas a API e encerra a sessao
 * quando o back responde 401 (token ausente/expirado) — exceto na propria
 * tentativa de login, cujo erro e tratado no formulario.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const ehLogin = req.url.includes('/api/auth/login');
  const token = auth.token();

  const requisicao = token && !ehLogin
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((err: unknown) => {
      const status = (err as { status?: number })?.status;
      if (status === 401 && !ehLogin) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
