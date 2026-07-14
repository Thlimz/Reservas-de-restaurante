package io.duranium.reservas.controller;

import io.duranium.reservas.dto.MesaDtos.MesaRequest;
import io.duranium.reservas.dto.MesaDtos.MesaResponse;
import io.duranium.reservas.service.MesaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mesas")
public class MesaController {

    private final MesaService mesaService;

    public MesaController(MesaService mesaService) {
        this.mesaService = mesaService;
    }

    /** POST /mesas -> Cadastrar mesa/sala */
    @PostMapping
    public ResponseEntity<MesaResponse> criar(@Valid @RequestBody MesaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mesaService.criar(req));
    }
}
