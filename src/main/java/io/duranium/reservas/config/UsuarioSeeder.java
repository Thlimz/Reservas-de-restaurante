package io.duranium.reservas.config;

import io.duranium.reservas.model.Papel;
import io.duranium.reservas.model.Restaurante;
import io.duranium.reservas.model.Usuario;
import io.duranium.reservas.repository.RestauranteRepository;
import io.duranium.reservas.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Cria os usuarios iniciais (idempotente — so insere se o username nao existir):
 *  - Th (ADMIN, senha via propriedade app.seed.admin-senha)
 *  - cantina / sushi (logins de demonstracao dos restaurantes do seed)
 * As senhas sao gravadas como hash BCrypt.
 */
@Configuration
public class UsuarioSeeder {

    private static final Logger log = LoggerFactory.getLogger(UsuarioSeeder.class);

    @Bean
    CommandLineRunner seedUsuarios(UsuarioRepository usuarios,
                                   RestauranteRepository restaurantes,
                                   PasswordEncoder encoder,
                                   org.springframework.core.env.Environment env) {
        return args -> {
            String senhaAdmin = env.getProperty("app.seed.admin-senha", "AdminTh@01");
            criarSeNaoExiste(usuarios, "Th", senhaAdmin, Papel.ADMIN, null, encoder);

            restaurantes.findById(1L).ifPresent(r ->
                    criarSeNaoExiste(usuarios, "cantina", "Cantina@01", Papel.RESTAURANTE, r, encoder));
            restaurantes.findById(2L).ifPresent(r ->
                    criarSeNaoExiste(usuarios, "sushi", "Sushi@01", Papel.RESTAURANTE, r, encoder));
        };
    }

    private void criarSeNaoExiste(UsuarioRepository usuarios, String username, String senha,
                                  Papel papel, Restaurante restaurante, PasswordEncoder encoder) {
        if (usuarios.existsByUsername(username)) {
            return;
        }
        usuarios.save(new Usuario(username, encoder.encode(senha), papel, restaurante));
        log.info("Usuario seed criado: {} ({})", username, papel);
    }
}
