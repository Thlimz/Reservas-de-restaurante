package io.duranium.reservas.service;

import io.duranium.reservas.dto.MesaDtos.MesaRequest;
import io.duranium.reservas.dto.MesaDtos.MesaResponse;
import io.duranium.reservas.exception.RecursoNaoEncontradoException;
import io.duranium.reservas.model.Mesa;
import io.duranium.reservas.model.Restaurante;
import io.duranium.reservas.repository.MesaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MesaService {

    private final MesaRepository repository;
    private final RestauranteService restauranteService;

    public MesaService(MesaRepository repository, RestauranteService restauranteService) {
        this.repository = repository;
        this.restauranteService = restauranteService;
    }

    public MesaResponse criar(MesaRequest req) {
        Restaurante restaurante = restauranteService.obter(req.restauranteId());
        Mesa mesa = new Mesa();
        mesa.setRestaurante(restaurante);
        mesa.setNumero(req.numero());
        mesa.setCapacidade(req.capacidade());
        mesa.setTipo(req.tipo());
        mesa.setAtivo(req.ativo() == null ? true : req.ativo());
        return toResponse(repository.save(mesa));
    }

    public List<MesaResponse> listarPorRestaurante(Long restauranteId) {
        // Garante que o restaurante existe (404 caso contrario).
        restauranteService.obter(restauranteId);
        return repository.findByRestauranteIdOrderByNumeroAsc(restauranteId)
                .stream().map(this::toResponse).toList();
    }

    public Mesa obter(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Mesa nao encontrada: id=" + id));
    }

    private MesaResponse toResponse(Mesa m) {
        return new MesaResponse(
                m.getId(),
                m.getRestaurante().getId(),
                m.getNumero(),
                m.getCapacidade(),
                m.getTipo(),
                m.isAtivo());
    }
}
