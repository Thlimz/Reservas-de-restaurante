package io.duranium.reservas.security;

import io.duranium.reservas.model.Papel;
import io.duranium.reservas.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

/** Geracao e validacao de tokens JWT (HS256). */
@Service
public class JwtService {

    private final SecretKey chave;
    private final Duration validade;

    public JwtService(@Value("${app.jwt.secret}") String segredo,
                      @Value("${app.jwt.expiracao-horas}") long expiracaoHoras) {
        this.chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));
        this.validade = Duration.ofHours(expiracaoHoras);
    }

    /** Gera um token contendo username (subject), papel e restauranteId. */
    public String gerar(Usuario usuario) {
        Date agora = new Date();
        var builder = Jwts.builder()
                .subject(usuario.getUsername())
                .claim("papel", usuario.getPapel().name())
                .issuedAt(agora)
                .expiration(new Date(agora.getTime() + validade.toMillis()));
        if (usuario.getRestaurante() != null) {
            builder.claim("restauranteId", usuario.getRestaurante().getId());
        }
        return builder.signWith(chave).compact();
    }

    /**
     * Valida assinatura/expiracao e devolve a identidade contida no token.
     * Lanca JwtException (subclasses) se o token for invalido ou expirado.
     */
    public UsuarioAutenticado validar(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Long restauranteId = claims.get("restauranteId", Long.class);
        return new UsuarioAutenticado(
                claims.getSubject(),
                Papel.valueOf(claims.get("papel", String.class)),
                restauranteId);
    }
}
