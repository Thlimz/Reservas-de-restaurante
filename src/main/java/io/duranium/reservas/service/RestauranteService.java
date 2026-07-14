package io.duranium.reservas.service;

import io.duranium.reservas.dto.RestauranteDtos.RestauranteRequest;
import io.duranium.reservas.dto.RestauranteDtos.RestauranteResponse;
import io.duranium.reservas.exception.RecursoNaoEncontradoException;
import io.duranium.reservas.model.Restaurante;
import io.duranium.reservas.repository.RestauranteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestauranteService {

    private final RestauranteRepository repository;

    public RestauranteService(RestauranteRepository repository) {
        this.repository = repository;
    }

    public RestauranteResponse criar(RestauranteRequest req) {
        Restaurante r = new Restaurante(req.nome(), req.endereco(), req.telefone());
        return toResponse(repository.save(r));
    }

    public List<RestauranteResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public RestauranteResponse buscarPorId(Long id) {
        return toResponse(obter(id));
    }

    /** Uso interno: retorna a entidade ou lanca 404. */
    public Restaurante obter(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Restaurante nao encontrado: id=" + id));
    }

    private RestauranteResponse toResponse(Restaurante r) {
        return new RestauranteResponse(r.getId(), r.getNome(), r.getEndereco(), r.getTelefone());
    }
}
