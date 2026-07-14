package io.duranium.reservas.dto;

import io.duranium.reservas.model.TipoMesa;

/** DTOs de saida do recurso Disponibilidade. */
public class DisponibilidadeDtos {

    public record MesaDisponibilidade(
            Long mesaId,
            Integer numero,
            Integer capacidade,
            TipoMesa tipo,
            boolean disponivel
    ) {
    }
}
