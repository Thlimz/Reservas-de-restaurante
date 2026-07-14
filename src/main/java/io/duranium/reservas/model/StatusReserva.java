package io.duranium.reservas.model;

/**
 * Ciclo de vida de uma reserva.
 * AGENDADA   -> aguardando confirmacao
 * CONFIRMADA -> reserva valida
 * CANCELADA  -> reserva cancelada
 * FINALIZADA -> reserva ja ocorreu
 */
public enum StatusReserva {
    AGENDADA,
    CONFIRMADA,
    CANCELADA,
    FINALIZADA
}
