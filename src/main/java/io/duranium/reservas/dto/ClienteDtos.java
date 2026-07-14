package io.duranium.reservas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** DTOs de entrada e saida do recurso Cliente. */
public class ClienteDtos {

    public record ClienteRequest(
            @NotBlank(message = "O nome do cliente e obrigatorio")
            String nome,
            String telefone,
            @Email(message = "E-mail invalido")
            String email
    ) {
    }

    public record ClienteResponse(
            Long id,
            String nome,
            String telefone,
            String email
    ) {
    }
}
