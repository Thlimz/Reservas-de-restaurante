package io.duranium.reservas.service;

import io.duranium.reservas.dto.DisponibilidadeDtos.MesaDisponibilidade;
import io.duranium.reservas.exception.RegraNegocioException;
import io.duranium.reservas.model.Mesa;
import io.duranium.reservas.repository.MesaRepository;
import io.duranium.reservas.repository.ReservaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Service
public class DisponibilidadeService {

    private final MesaRepository mesaRepository;
    private final ReservaRepository reservaRepository;
    private final RestauranteService restauranteService;

    public DisponibilidadeService(MesaRepository mesaRepository,
                                  ReservaRepository reservaRepository,
                                  RestauranteService restauranteService) {
        this.mesaRepository = mesaRepository;
        this.reservaRepository = reservaRepository;
        this.restauranteService = restauranteService;
    }

    /**
     * Calcula, em tempo real, quais mesas ativas do restaurante estao livres
     * na janela [inicio, fim] da data informada.
     */
    public List<MesaDisponibilidade> consultar(Long restauranteId, LocalDate data,
                                               LocalTime inicio, LocalTime fim) {
        restauranteService.obter(restauranteId); // valida existencia (404)

        if (!fim.isAfter(inicio)) {
            throw new RegraNegocioException("O horario final deve ser maior que o inicial.");
        }

        List<Mesa> mesas = mesaRepository
                .findByRestauranteIdAndAtivoTrueOrderByNumeroAsc(restauranteId);

        Set<Long> ocupadas = Set.copyOf(
                reservaRepository.findMesasOcupadas(restauranteId, data, inicio, fim));

        return mesas.stream()
                .map(m -> new MesaDisponibilidade(
                        m.getId(),
                        m.getNumero(),
                        m.getCapacidade(),
                        m.getTipo(),
                        !ocupadas.contains(m.getId())))
                .toList();
    }
}
