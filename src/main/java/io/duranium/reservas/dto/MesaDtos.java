package io.duranium.reservas.dto;

import io.duranium.reservas.model.TipoMesa;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/** DTOs de entrada e saida do recurso Mesa. */
public class MesaDtos {

    public record MesaRequest(
            @NotNull(message = "O restauranteId e obrigatorio")
            Long restauranteId,
            @NotNull(message = "O numero da mesa e obrigatorio")
            Integer numero,
            @NotNull(message = "A capacidade e obrigatoria")
            @Positive(message = "A capacidade deve ser maior que zero")
            Integer capacidade,
            @NotNull(message = "O tipo (MESA ou SALA) e obrigatorio")
            TipoMesa tipo,
            Boolean ativo
    ) {
    }

    public record MesaResponse(
            Long id,
            Long restauranteId,
            Integer numero,
            Integer capacidade,
            TipoMesa tipo,
            boolean ativo
    ) {
    }
}
