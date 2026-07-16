package io.duranium.reservas.service;

import io.duranium.reservas.dto.ReservaDtos.ClienteResumo;
import io.duranium.reservas.dto.ReservaDtos.MesaResumo;
import io.duranium.reservas.dto.ReservaDtos.ReservaRequest;
import io.duranium.reservas.dto.ReservaDtos.ReservaResponse;
import io.duranium.reservas.exception.RecursoNaoEncontradoException;
import io.duranium.reservas.exception.RegraNegocioException;
import io.duranium.reservas.model.Cliente;
import io.duranium.reservas.model.Mesa;
import io.duranium.reservas.model.Reserva;
import io.duranium.reservas.model.StatusReserva;
import io.duranium.reservas.repository.ReservaRepository;
import io.duranium.reservas.security.Escopo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservaService {

    /** Antecedencia minima para cancelamento (regra 7 / lógica 4). */
    private static final long HORAS_MINIMAS_CANCELAMENTO = 2;

    private final ReservaRepository repository;
    private final ClienteService clienteService;
    private final MesaService mesaService;
    private final Escopo escopo;

    public ReservaService(ReservaRepository repository,
                          ClienteService clienteService,
                          MesaService mesaService,
                          Escopo escopo) {
        this.repository = repository;
        this.clienteService = clienteService;
        this.mesaService = mesaService;
        this.escopo = escopo;
    }

    @Transactional
    public ReservaResponse criar(ReservaRequest req) {
        Cliente cliente = clienteService.obter(req.clienteId());
        Mesa mesa = mesaService.obter(req.mesaId());

        // Escopo: logins de restaurante so reservam nas proprias mesas.
        escopo.validarRestaurante(mesa.getRestaurante().getId());

        // Consistencia: o cliente deve pertencer ao mesmo restaurante da mesa.
        if (cliente.getRestaurante() != null
                && !cliente.getRestaurante().getId().equals(mesa.getRestaurante().getId())) {
            throw new RegraNegocioException("O cliente pertence a outro restaurante.");
        }

        // Regra: a mesa precisa estar ativa.
        if (!mesa.isAtivo()) {
            throw new RegraNegocioException("A mesa " + mesa.getNumero() + " esta inativa.");
        }

        // Regra 1 (lógica): validar intervalo de horario.
        if (!req.horaFim().isAfter(req.horaInicio())) {
            throw new RegraNegocioException("A hora fim deve ser maior que a hora inicio.");
        }

        // Regra 5: nao e possivel reservar em data/horario passado.
        LocalDateTime inicioReserva = LocalDateTime.of(req.dataReserva(), req.horaInicio());
        if (inicioReserva.isBefore(LocalDateTime.now())) {
            throw new RegraNegocioException("Nao e possivel criar reserva em data/horario passado.");
        }

        // Regra 2: capacidade da mesa.
        if (req.pessoas() > mesa.getCapacidade()) {
            throw new RegraNegocioException(
                    "Numero de pessoas (" + req.pessoas() + ") excede a capacidade da mesa ("
                            + mesa.getCapacidade() + ").");
        }

        // Regra 3 (existeReserva): conflito de horario.
        boolean conflito = repository.existeConflito(
                mesa.getId(), req.dataReserva(), req.horaInicio(), req.horaFim(), null);
        if (conflito) {
            throw new RegraNegocioException(
                    "Mesa " + mesa.getNumero() + " ja esta reservada nesse horario.");
        }

        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setMesa(mesa);
        reserva.setDataReserva(req.dataReserva());
        reserva.setHoraInicio(req.horaInicio());
        reserva.setHoraFim(req.horaFim());
        reserva.setPessoas(req.pessoas());
        reserva.setObservacao(req.observacao());
        reserva.setStatus(StatusReserva.AGENDADA);
        reserva.setCriadoEm(LocalDateTime.now());

        return toResponse(repository.save(reserva));
    }

    public List<ReservaResponse> listar(LocalDate data, StatusReserva status, Long restauranteIdFiltro) {
        // RESTAURANTE: forcado ao proprio restaurante; ADMIN: filtro opcional.
        Long restauranteId = escopo.restauranteIdEfetivo(restauranteIdFiltro);
        return repository.buscarComFiltros(data, status, restauranteId).stream()
                .map(this::toResponse).toList();
    }

    public ReservaResponse detalhar(Long id) {
        Reserva reserva = obter(id);
        escopo.validarRestaurante(reserva.getMesa().getRestaurante().getId());
        return toResponse(reserva);
    }

    @Transactional
    public ReservaResponse atualizarStatus(Long id, StatusReserva novoStatus) {
        Reserva reserva = obter(id);
        escopo.validarRestaurante(reserva.getMesa().getRestaurante().getId());

        // Regra 4 (lógica): reservas canceladas/finalizadas nao podem ser alteradas.
        if (reserva.getStatus() == StatusReserva.CANCELADA
                || reserva.getStatus() == StatusReserva.FINALIZADA) {
            throw new RegraNegocioException(
                    "Reserva " + reserva.getStatus() + " nao pode ser alterada.");
        }

        // Regra 7: cancelamento permitido somente ate 2h antes do horario.
        if (novoStatus == StatusReserva.CANCELADA) {
            LocalDateTime limite = LocalDateTime
                    .of(reserva.getDataReserva(), reserva.getHoraInicio())
                    .minusHours(HORAS_MINIMAS_CANCELAMENTO);
            if (LocalDateTime.now().isAfter(limite)) {
                throw new RegraNegocioException(
                        "Cancelamento so e permitido ate " + HORAS_MINIMAS_CANCELAMENTO
                                + "h antes do horario da reserva.");
            }
        }

        reserva.setStatus(novoStatus);
        return toResponse(repository.save(reserva));
    }

    private Reserva obter(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Reserva nao encontrada: id=" + id));
    }

    private ReservaResponse toResponse(Reserva r) {
        Cliente c = r.getCliente();
        Mesa m = r.getMesa();
        return new ReservaResponse(
                r.getId(),
                new ClienteResumo(c.getId(), c.getNome(), c.getTelefone()),
                new MesaResumo(m.getId(), m.getNumero(), m.getCapacidade()),
                r.getDataReserva(),
                r.getHoraInicio(),
                r.getHoraFim(),
                r.getPessoas(),
                r.getStatus(),
                r.getObservacao(),
                r.getCriadoEm());
    }
}
