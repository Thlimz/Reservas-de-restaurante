package io.duranium.reservas.service;

import io.duranium.reservas.dto.ClienteDtos.ClienteRequest;
import io.duranium.reservas.dto.ClienteDtos.ClienteResponse;
import io.duranium.reservas.exception.RecursoNaoEncontradoException;
import io.duranium.reservas.exception.RegraNegocioException;
import io.duranium.reservas.model.Cliente;
import io.duranium.reservas.model.Restaurante;
import io.duranium.reservas.repository.ClienteRepository;
import io.duranium.reservas.security.Escopo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository repository;
    private final RestauranteService restauranteService;
    private final Escopo escopo;

    public ClienteService(ClienteRepository repository,
                          RestauranteService restauranteService,
                          Escopo escopo) {
        this.repository = repository;
        this.restauranteService = restauranteService;
        this.escopo = escopo;
    }

    public ClienteResponse criar(ClienteRequest req) {
        // RESTAURANTE: sempre o proprio; ADMIN: precisa informar no payload.
        Long restauranteId = escopo.restauranteIdEfetivo(req.restauranteId());
        if (restauranteId == null) {
            throw new RegraNegocioException("Informe o restauranteId do cliente.");
        }
        Restaurante restaurante = restauranteService.obter(restauranteId);
        Cliente c = new Cliente(req.nome(), req.telefone(), req.email(), restaurante);
        return toResponse(repository.save(c));
    }

    /** RESTAURANTE ve os proprios clientes; ADMIN ve todos (ou filtra por restaurante). */
    public List<ClienteResponse> listar(Long restauranteIdFiltro) {
        Long restauranteId = escopo.restauranteIdEfetivo(restauranteIdFiltro);
        List<Cliente> clientes = restauranteId == null
                ? repository.findAll()
                : repository.findByRestauranteIdOrderByNomeAsc(restauranteId);
        return clientes.stream().map(this::toResponse).toList();
    }

    public Cliente obter(Long id) {
        Cliente cliente = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Cliente nao encontrado: id=" + id));
        if (cliente.getRestaurante() != null) {
            escopo.validarRestaurante(cliente.getRestaurante().getId());
        }
        return cliente;
    }

    private ClienteResponse toResponse(Cliente c) {
        return new ClienteResponse(
                c.getId(),
                c.getNome(),
                c.getTelefone(),
                c.getEmail(),
                c.getRestaurante() != null ? c.getRestaurante().getId() : null);
    }
}
