package io.duranium.reservas.exception;

/** Lancada quando uma regra de negocio e violada (resulta em HTTP 422). */
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
