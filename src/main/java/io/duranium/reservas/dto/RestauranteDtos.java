package io.duranium.reservas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** DTOs de entrada e saida do recurso Restaurante. */
public class RestauranteDtos {

    /** Criacao de restaurante inclui as credenciais de acesso dele (definidas pelo ADMIN). */
    public record RestauranteRequest(
            @NotBlank(message = "O nome do restaurante e obrigatorio")
            String nome,
            String endereco,
            String telefone,
            @NotBlank(message = "O usuario de acesso e obrigatorio")
            @Size(min = 3, max = 60, message = "O usuario deve ter entre 3 e 60 caracteres")
            String usuario,
            @NotBlank(message = "A senha de acesso e obrigatoria")
            @Size(min = 6, message = "A senha deve ter no minimo 6 caracteres")
            String senha
    ) {
    }

    public record RestauranteResponse(
            Long id,
            String nome,
            String endereco,
            String telefone
    ) {
    }
}
