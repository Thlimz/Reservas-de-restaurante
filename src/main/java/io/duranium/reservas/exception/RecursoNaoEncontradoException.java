package io.duranium.reservas.exception;

/** Lancada quando um recurso referenciado nao existe (resulta em HTTP 404). */
public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
