package io.duranium.reservas.security;

import io.duranium.reservas.exception.AcessoNegadoException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Regras de escopo por restaurante, derivadas do usuario autenticado:
 * ADMIN opera qualquer restaurante; RESTAURANTE apenas o proprio.
 */
@Component
public class Escopo {

    /** Usuario autenticado da requisicao atual (null se anonimo). */
    public UsuarioAutenticado atual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioAutenticado usuario) {
            return usuario;
        }
        return null;
    }

    public boolean isAdmin() {
        UsuarioAutenticado u = atual();
        return u != null && u.isAdmin();
    }

    /** Garante que o usuario pode operar o restaurante informado. */
    public void validarRestaurante(Long restauranteId) {
        UsuarioAutenticado u = atual();
        if (u == null || u.isAdmin()) {
            return;
        }
        if (restauranteId == null || !restauranteId.equals(u.restauranteId())) {
            throw new AcessoNegadoException("Operacao permitida apenas para o proprio restaurante.");
        }
    }

    /**
     * Restaurante em que a operacao deve acontecer:
     * RESTAURANTE -> sempre o proprio (ignora o solicitado);
     * ADMIN       -> o solicitado (pode ser null, ex.: filtro opcional).
     */
    public Long restauranteIdEfetivo(Long solicitado) {
        UsuarioAutenticado u = atual();
        if (u != null && !u.isAdmin()) {
            return u.restauranteId();
        }
        return solicitado;
    }
}
