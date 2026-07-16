package io.duranium.reservas.exception;

/** Lancada quando o usuario tenta acessar dados de outro restaurante (HTTP 403). */
public class AcessoNegadoException extends RuntimeException {
    public AcessoNegadoException(String mensagem) {
        super(mensagem);
    }
}
