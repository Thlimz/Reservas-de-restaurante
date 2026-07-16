package io.duranium.reservas.dto;

import io.duranium.reservas.model.Papel;
import jakarta.validation.constraints.NotBlank;

/** DTOs de autenticacao. */
public class AuthDtos {

    public record LoginRequest(
            @NotBlank(message = "Informe o usuario")
            String username,
            @NotBlank(message = "Informe a senha")
            String senha
    ) {
    }

    /** Sessao devolvida no login e no /me. restauranteId/Nome sao null para ADMIN. */
    public record SessaoResponse(
            String token,
            String username,
            Papel papel,
            Long restauranteId,
            String restauranteNome
    ) {
    }
}
