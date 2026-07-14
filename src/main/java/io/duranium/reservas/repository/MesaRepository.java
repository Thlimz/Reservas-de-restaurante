package io.duranium.reservas.repository;

import io.duranium.reservas.model.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MesaRepository extends JpaRepository<Mesa, Long> {

    List<Mesa> findByRestauranteIdOrderByNumeroAsc(Long restauranteId);

    List<Mesa> findByRestauranteIdAndAtivoTrueOrderByNumeroAsc(Long restauranteId);
}
