import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/models';
import { ToastService } from '../services/toast.service';

function toApiError(err: HttpErrorResponse): ApiError {
  const body = (err.error ?? {}) as Partial<ApiError> & { camposInvalidos?: Record<string, string> };
  let message = body.message ?? '';
  if (!message) {
    if (err.status === 0) { message = 'Nao foi possivel conectar ao servidor.'; }
    else if (err.status === 404) { message = 'Recurso nao encontrado.'; }
    else { message = 'Ocorreu um erro inesperado. Tente novamente.'; }
  }
  return { status: err.status, message, camposInvalidos: body.camposInvalidos ?? {} };
}

/** Traduz o formato de erro da API em ApiError e notifica (exceto 400, tratado no formulario). */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const apiError = toApiError(err);
      if (apiError.status !== 400) { toast.error(apiError.message); }
      return throwError(() => apiError);
    }),
  );
};