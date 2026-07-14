package io.duranium.reservas.dto;

import jakarta.validation.constraints.NotBlank;

/** DTOs de entrada e saida do recurso Restaurante. */
public class RestauranteDtos {

    public record RestauranteRequest(
            @NotBlank(message = "O nome do restaurante e obrigatorio")
            String nome,
            String endereco,
            String telefone
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
