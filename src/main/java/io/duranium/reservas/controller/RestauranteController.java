package io.duranium.reservas.controller;

import io.duranium.reservas.dto.DisponibilidadeDtos.MesaDisponibilidade;
import io.duranium.reservas.dto.MesaDtos.MesaResponse;
import io.duranium.reservas.dto.RestauranteDtos.RestauranteRequest;
import io.duranium.reservas.dto.RestauranteDtos.RestauranteResponse;
import io.duranium.reservas.service.DisponibilidadeService;
import io.duranium.reservas.service.MesaService;
import io.duranium.reservas.service.RestauranteService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/restaurantes")
public class RestauranteController {

    private final RestauranteService restauranteService;
    private final MesaService mesaService;
    private final DisponibilidadeService disponibilidadeService;

    public RestauranteController(RestauranteService restauranteService,
                                 MesaService mesaService,
                                 DisponibilidadeService disponibilidadeService) {
        this.restauranteService = restauranteService;
        this.mesaService = mesaService;
        this.disponibilidadeService = disponibilidadeService;
    }

    /** POST /restaurantes -> Criar restaurante */
    @PostMapping
    public ResponseEntity<RestauranteResponse> criar(@Valid @RequestBody RestauranteRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(restauranteService.criar(req));
    }

    /** GET /restaurantes -> Listar restaurantes (auxiliar) */
    @GetMapping
    public List<RestauranteResponse> listar() {
        return restauranteService.listar();
    }

    /** GET /restaurantes/{id} -> Detalhar restaurante (auxiliar) */
    @GetMapping("/{id}")
    public RestauranteResponse detalhar(@PathVariable Long id) {
        return restauranteService.buscarPorId(id);
    }

    /** GET /restaurantes/{restauranteId}/mesas -> Listar mesas do restaurante */
    @GetMapping("/{restauranteId}/mesas")
    public List<MesaResponse> listarMesas(@PathVariable Long restauranteId) {
        return mesaService.listarPorRestaurante(restauranteId);
    }

    /**
     * GET /restaurantes/{restauranteId}/disponibilidade?data=&inicio=&fim=
     * Ver disponibilidade de mesas em uma janela de horario.
     */
    @GetMapping("/{restauranteId}/disponibilidade")
    public List<MesaDisponibilidade> disponibilidade(
            @PathVariable Long restauranteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime inicio,
            @RequestParam @DateTimeFormat(pattern = "HH:mm") LocalTime fim) {
        return disponibilidadeService.consultar(restauranteId, data, inicio, fim);
    }
}
