package io.duranium.reservas.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.HandlerTypePredicate;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Configuracao da camada web.
 *
 * <p>Responsavel por dois pontos que permitem hospedar uma SPA (Angular) no mesmo
 * servidor da API, sem colisao de rotas:
 *
 * <ol>
 *   <li><b>Prefixo /api</b> — todos os {@code @RestController} passam a responder sob
 *       {@code /api/...}. Isso libera as rotas de raiz (ex.: {@code /reservas}) para o
 *       roteador do front-end.</li>
 *   <li><b>Fallback SPA</b> — qualquer rota desconhecida que nao seja da API nem um
 *       arquivo estatico existente devolve o {@code index.html}, para que o roteamento
 *       do lado do cliente funcione ao recarregar a pagina (deep link).</li>
 * </ol>
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final String API_PREFIX = "/api";
    private static final String STATIC_LOCATION = "classpath:/static/";
    private static final String INDEX_HTML = "/static/index.html";

    /** Aplica o prefixo /api a todos os controllers REST, sem alterar as classes. */
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix(API_PREFIX, HandlerTypePredicate.forAnnotation(RestController.class));
    }

    /**
     * Serve o arquivo estatico quando ele existe; caso contrario devolve o index.html
     * (rota da SPA). Requisicoes para /api/** nao sao tratadas aqui: retornam null para
     * que um endpoint inexistente continue resultando em 404, e nao no index.html.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations(STATIC_LOCATION)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }
                        Resource requested = location.createRelative(resourcePath);
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }
                        return new ClassPathResource(INDEX_HTML);
                    }
                });
    }
}
