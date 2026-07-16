package io.duranium.reservas.security;

import io.duranium.reservas.model.Papel;

/**
 * Identidade extraida do token JWT e disponibilizada no SecurityContext.
 * restauranteId e null quando o papel e ADMIN.
 */
public record UsuarioAutenticado(String username, Papel papel, Long restauranteId) {

    public boolean isAdmin() {
        return papel == Papel.ADMIN;
    }
}
