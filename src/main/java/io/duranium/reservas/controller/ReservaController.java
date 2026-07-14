package io.duranium.reservas.controller;

import io.duranium.reservas.dto.ReservaDtos.ReservaRequest;
import io.duranium.reservas.dto.ReservaDtos.ReservaResponse;
import io.duranium.reservas.dto.ReservaDtos.StatusUpdateRequest;
import io.duranium.reservas.model.StatusReserva;
import io.duranium.reservas.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    /** POST /reservas -> Criar reserva */
    @PostMapping
    public ResponseEntity<ReservaResponse> criar(@Valid @RequestBody ReservaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.criar(req));
    }

    /** GET /reservas?data=&status= -> Listar reservas (filtros opcionais) */
    @GetMapping
    public List<ReservaResponse> listar(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false) StatusReserva status) {
        return reservaService.listar(data, status);
    }

    /** GET /reservas/{id} -> Detalhar reserva */
    @GetMapping("/{id}")
    public ReservaResponse detalhar(@PathVariable Long id) {
        return reservaService.detalhar(id);
    }

    /** PATCH /reservas/{id} -> Atualizar status da reserva */
    @PatchMapping("/{id}")
    public ReservaResponse atualizarStatus(@PathVariable Long id,
                                           @Valid @RequestBody StatusUpdateRequest req) {
        return reservaService.atualizarStatus(id, req.status());
    }
}
