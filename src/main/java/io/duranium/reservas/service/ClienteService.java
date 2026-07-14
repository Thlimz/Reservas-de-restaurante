package io.duranium.reservas.service;

import io.duranium.reservas.dto.ClienteDtos.ClienteRequest;
import io.duranium.reservas.dto.ClienteDtos.ClienteResponse;
import io.duranium.reservas.exception.RecursoNaoEncontradoException;
import io.duranium.reservas.model.Cliente;
import io.duranium.reservas.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public ClienteResponse criar(ClienteRequest req) {
        Cliente c = new Cliente(req.nome(), req.telefone(), req.email());
        return toResponse(repository.save(c));
    }

    public List<ClienteResponse> listar() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public Cliente obter(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Cliente nao encontrado: id=" + id));
    }

    private ClienteResponse toResponse(Cliente c) {
        return new ClienteResponse(c.getId(), c.getNome(), c.getTelefone(), c.getEmail());
    }
}
