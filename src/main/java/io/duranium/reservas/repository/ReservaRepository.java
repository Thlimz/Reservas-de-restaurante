package io.duranium.reservas.repository;

import io.duranium.reservas.model.Reserva;
import io.duranium.reservas.model.StatusReserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    /**
     * Regra 3 (existeReserva): verifica se ha conflito de horario para a mesa.
     * Considera apenas reservas AGENDADA ou CONFIRMADA e a sobreposicao de intervalos
     * (inicio < fim_existente AND fim > inicio_existente).
     * O parametro ignorarId permite excluir a propria reserva ao editar.
     */
    @Query("""
            SELECT COUNT(r) > 0 FROM Reserva r
            WHERE r.mesa.id = :mesaId
              AND r.dataReserva = :data
              AND r.status IN (io.duranium.reservas.model.StatusReserva.AGENDADA,
                               io.duranium.reservas.model.StatusReserva.CONFIRMADA)
              AND r.horaInicio < :horaFim
              AND r.horaFim > :horaInicio
              AND (:ignorarId IS NULL OR r.id <> :ignorarId)
            """)
    boolean existeConflito(@Param("mesaId") Long mesaId,
                           @Param("data") LocalDate data,
                           @Param("horaInicio") LocalTime horaInicio,
                           @Param("horaFim") LocalTime horaFim,
                           @Param("ignorarId") Long ignorarId);

    /**
     * IDs das mesas de um restaurante que estao ocupadas em uma janela de horario.
     * Usado no calculo de disponibilidade. Considera apenas AGENDADA/CONFIRMADA.
     */
    @Query("""
            SELECT DISTINCT r.mesa.id FROM Reserva r
            WHERE r.mesa.restaurante.id = :restauranteId
              AND r.dataReserva = :data
              AND r.status IN (io.duranium.reservas.model.StatusReserva.AGENDADA,
                               io.duranium.reservas.model.StatusReserva.CONFIRMADA)
              AND r.horaInicio < :fim
              AND r.horaFim > :inicio
            """)
    List<Long> findMesasOcupadas(@Param("restauranteId") Long restauranteId,
                                 @Param("data") LocalDate data,
                                 @Param("inicio") LocalTime inicio,
                                 @Param("fim") LocalTime fim);

    /**
     * Listagem de reservas com filtros opcionais de data e status.
     */
    @Query("""
            SELECT r FROM Reserva r
            WHERE (:data IS NULL OR r.dataReserva = :data)
              AND (:status IS NULL OR r.status = :status)
            ORDER BY r.dataReserva ASC, r.horaInicio ASC
            """)
    List<Reserva> buscarComFiltros(@Param("data") LocalDate data,
                                   @Param("status") StatusReserva status);
}
