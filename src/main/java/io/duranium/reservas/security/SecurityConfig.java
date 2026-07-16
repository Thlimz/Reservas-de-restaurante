package io.duranium.reservas.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.time.LocalDateTime;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // login e aberto
                        .requestMatchers("/api/auth/**").permitAll()
                        // gestao de restaurantes e exclusiva do ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/restaurantes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/restaurantes").hasRole("ADMIN")
                        // demais rotas da API exigem estar logado (escopo fino nos services)
                        .requestMatchers("/api/**").authenticated()
                        // SPA e arquivos estaticos sao publicos (o login acontece dentro dela)
                        .anyRequest().permitAll())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) ->
                                escreverErro(res, HttpServletResponse.SC_UNAUTHORIZED,
                                        "Unauthorized", "Autenticacao necessaria. Faca login."))
                        .accessDeniedHandler((req, res, e) ->
                                escreverErro(res, HttpServletResponse.SC_FORBIDDEN,
                                        "Forbidden", "Voce nao tem permissao para esta operacao.")))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** Resposta de erro no mesmo formato JSON do ApiExceptionHandler. */
    private void escreverErro(HttpServletResponse res, int status, String erro, String mensagem)
            throws java.io.IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("""
                {"timestamp":"%s","status":%d,"error":"%s","message":"%s"}"""
                .formatted(LocalDateTime.now(), status, erro, mensagem));
    }
}
