package io.duranium.reservas.controller;

import io.duranium.reservas.dto.ClienteDtos.ClienteRequest;
import io.duranium.reservas.dto.ClienteDtos.ClienteResponse;
import io.duranium.reservas.service.ClienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    /** POST /clientes -> Cadastrar cliente */
    @PostMapping
    public ResponseEntity<ClienteResponse> criar(@Valid @RequestBody ClienteRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.criar(req));
    }

    /**
     * GET /clientes -> Listar clientes.
     * Logins de restaurante veem apenas os proprios; ADMIN pode filtrar por restauranteId.
     */
    @GetMapping
    public List<ClienteResponse> listar(@RequestParam(required = false) Long restauranteId) {
        return clienteService.listar(restauranteId);
    }
}
