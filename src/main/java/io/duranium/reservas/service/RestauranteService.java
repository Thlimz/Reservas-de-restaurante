package io.duranium.reservas.service;

import io.duranium.reservas.dto.RestauranteDtos.RestauranteRequest;
import io.duranium.reservas.dto.RestauranteDtos.RestauranteResponse;
import io.duranium.reservas.exception.RecursoNaoEncontradoException;
import io.duranium.reservas.exception.RegraNegocioException;
import io.duranium.reservas.model.Papel;
import io.duranium.reservas.model.Restaurante;
import io.duranium.reservas.model.Usuario;
import io.duranium.reservas.repository.RestauranteRepository;
import io.duranium.reservas.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RestauranteService {

    private final RestauranteRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public RestauranteService(RestauranteRepository repository,
                              UsuarioRepository usuarioRepository,
                              PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /** Cria o restaurante e o login (papel RESTAURANTE) dele — operacao do ADMIN. */
    @Transactional
    public RestauranteResponse criar(RestauranteRequest req) {
        String username = req.usuario().trim();
        if (usuarioRepository.existsByUsername(username)) {
            throw new RegraNegocioException("O usuario '" + username + "' ja esta em uso.");
        }
        Restaurante r = repository.save(new Restaurante(req.nome(), req.endereco(), req.telefone()));
        usuarioRepository.save(new Usuario(
                username,
                passwordEncoder.encode(req.senha()),
                Papel.RESTAURANTE,
                r));
        return toResponse(r);
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
