package io.duranium.reservas.repository;

import io.duranium.reservas.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    List<Cliente> findByRestauranteIdOrderByNomeAsc(Long restauranteId);
}
