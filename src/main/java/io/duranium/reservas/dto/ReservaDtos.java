package io.duranium.reservas.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.duranium.reservas.model.StatusReserva;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/** DTOs de entrada e saida do recurso Reserva. */
public class ReservaDtos {

    /** Payload de criacao (conforme exemplo do diagrama). */
    public record ReservaRequest(
            @NotNull(message = "O clienteId e obrigatorio")
            Long clienteId,
            @NotNull(message = "O mesaId e obrigatorio")
            Long mesaId,
            @NotNull(message = "A dataReserva e obrigatoria")
            @JsonFormat(pattern = "yyyy-MM-dd")
            LocalDate dataReserva,
            @NotNull(message = "A horaInicio e obrigatoria")
            @JsonFormat(pattern = "HH:mm")
            LocalTime horaInicio,
            @NotNull(message = "A horaFim e obrigatoria")
            @JsonFormat(pattern = "HH:mm")
            LocalTime horaFim,
            @NotNull(message = "O numero de pessoas e obrigatorio")
            @Positive(message = "O numero de pessoas deve ser maior que zero")
            Integer pessoas,
            String observacao
    ) {
    }

    /** Payload de atualizacao de status. */
    public record StatusUpdateRequest(
            @NotNull(message = "O status e obrigatorio")
            StatusReserva status
    ) {
    }

    /** Resumo de cliente aninhado na resposta. */
    public record ClienteResumo(Long id, String nome, String telefone) {
    }

    /** Resumo de mesa aninhado na resposta. */
    public record MesaResumo(Long id, Integer numero, Integer capacidade) {
    }

    public record ReservaResponse(
            Long id,
            ClienteResumo cliente,
            MesaResumo mesa,
            @JsonFormat(pattern = "yyyy-MM-dd")
            LocalDate dataReserva,
            @JsonFormat(pattern = "HH:mm")
            LocalTime horaInicio,
            @JsonFormat(pattern = "HH:mm")
            LocalTime horaFim,
            Integer pessoas,
            StatusReserva status,
            String observacao,
            LocalDateTime criadoEm
    ) {
    }
}
