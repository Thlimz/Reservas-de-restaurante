package io.duranium.reservas.controller;

import io.duranium.reservas.dto.AuthDtos.LoginRequest;
import io.duranium.reservas.dto.AuthDtos.SessaoResponse;
import io.duranium.reservas.model.Usuario;
import io.duranium.reservas.repository.UsuarioRepository;
import io.duranium.reservas.security.JwtService;
import io.duranium.reservas.security.UsuarioAutenticado;
import io.duranium.reservas.security.Escopo;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final Escopo escopo;

    public AuthController(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService,
                          Escopo escopo) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.escopo = escopo;
    }

    /** POST /api/auth/login -> autentica e devolve o token JWT. */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        Optional<Usuario> usuario = usuarioRepository.findByUsername(req.username().trim());
        if (usuario.isEmpty()
                || !passwordEncoder.matches(req.senha(), usuario.get().getSenhaHash())) {
            // Mensagem generica de proposito: nao revelar se o usuario existe.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "timestamp", LocalDateTime.now().toString(),
                    "status", 401,
                    "error", "Unauthorized",
                    "message", "Usuario ou senha invalidos."));
        }
        Usuario u = usuario.get();
        return ResponseEntity.ok(new SessaoResponse(
                jwtService.gerar(u),
                u.getUsername(),
                u.getPapel(),
                u.getRestaurante() != null ? u.getRestaurante().getId() : null,
                u.getRestaurante() != null ? u.getRestaurante().getNome() : null));
    }

    /** GET /api/auth/me -> dados da sessao atual (sem renovar o token). */
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        UsuarioAutenticado atual = escopo.atual();
        if (atual == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "timestamp", LocalDateTime.now().toString(),
                    "status", 401,
                    "error", "Unauthorized",
                    "message", "Autenticacao necessaria."));
        }
        String nome = usuarioRepository.findByUsername(atual.username())
                .map(u -> u.getRestaurante() != null ? u.getRestaurante().getNome() : null)
                .orElse(null);
        return ResponseEntity.ok(new SessaoResponse(
                null, atual.username(), atual.papel(), atual.restauranteId(), nome));
    }
}
