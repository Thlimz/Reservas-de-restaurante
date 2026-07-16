# 🍽️ Sistema de Reservas para Restaurantes

Aplicação full stack para gerenciar **restaurantes, mesas/salas, clientes e reservas**,
calculando a disponibilidade em tempo real e evitando conflitos de horário.
API REST em **Spring Boot** + SPA em **Angular**, servidos na mesma origem.

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen)
![Angular](https://img.shields.io/badge/Angular-18-dd0031)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6)
![MySQL](https://img.shields.io/badge/MySQL-8.4-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 Descrição

Restaurantes que aceitam reservas por telefone/planilha sofrem com **overbooking** (duas reservas
para a mesma mesa no mesmo horário), reservas acima da capacidade da mesa e falta de visão do que
está livre. Este projeto resolve isso com um **backend transacional** que centraliza as regras de
negócio: valida capacidade, impede sobreposição de horários, controla o ciclo de vida da reserva e
calcula a disponibilidade das mesas em tempo real.

Acompanha um **protótipo web** (servido pelo próprio Spring) para operar tudo pelo navegador.

---

## ✨ Funcionalidades

- **Login por restaurante (multi-tenant)** — cada restaurante tem o próprio acesso e enxerga
  **apenas os próprios dados** (mesas, clientes, reservas, disponibilidade). Autenticação via
  **JWT** (Spring Security), com dois papéis:
  - `ADMIN` — acesso total; único que gerencia restaurantes e cria os logins deles;
  - `RESTAURANTE` — opera somente o próprio restaurante (escopo aplicado no back-end).
- **Restaurantes** — cadastro e listagem (exclusivo do ADMIN; o cadastro já cria o login do restaurante).
- **Mesas/Salas** — cadastro com capacidade e tipo (`MESA` ou `SALA`), listagem por restaurante.
- **Clientes** — cadastro e listagem.
- **Reservas** — criação com validação completa de regras de negócio:
  - ❌ rejeita data/horário no passado;
  - ❌ rejeita número de pessoas acima da capacidade da mesa;
  - ❌ rejeita conflito de horário (mesa já reservada na janela — a função `existeReserva`);
  - ❌ rejeita mesa inativa.
- **Ciclo de status** — `AGENDADA` → `CONFIRMADA` → `FINALIZADA`, ou `CANCELADA`.
  - Cancelamento permitido **somente até 2h antes** do horário;
  - reservas `CANCELADA`/`FINALIZADA` tornam-se imutáveis.
- **Disponibilidade em tempo real** — consulta quais mesas estão livres em uma janela de horário
  (considera apenas reservas `AGENDADA`/`CONFIRMADA`).
- **Filtros** — listagem de reservas por data e/ou status.
- **Tratamento de erros** padronizado em JSON (404, 422, validação de campos).
- **Protótipo web** responsivo (HTML/CSS/JS puro) com abas para todas as operações.

---

## 🛠️ Tecnologias

- **Java 17** (bytecode `release 17`; validado rodando também no JDK 25)
- **Spring Boot 3.3.5**
- **Spring Web** — API REST
- **Spring Security + JWT (jjwt)** — autenticação stateless e autorização por papel
- **Spring Data JPA** + **Hibernate 6.5** — persistência
- **Jakarta Bean Validation** — validação de payloads
- **MySQL 8.4**
- **Docker** / **Docker Compose** — banco de dados containerizado
- **Maven** (com **Maven Wrapper** — não exige Maven instalado)

**Front-end**

- **Angular 18** — standalone components, signals, novo control flow (`@if` / `@for`)
- **TypeScript 5.5** em modo `strict`
- **RxJS** + `HttpClient`, com interceptor para tratamento centralizado de erros
- **CSS autoral** (sem bibliotecas de UI), com tema claro/escuro
- **frontend-maven-plugin** — integra o build do Angular ao ciclo do Maven

---

## 🏗️ Arquitetura

SPA Angular consumindo uma API Spring Boot em **camadas**, com fluxo de dependência
unidirecional. Ambos são servidos na **mesma origem** (`:8080`), o que elimina CORS:
o Spring devolve o `index.html` para as rotas do roteador Angular e reserva o prefixo
`/api` para a API.

```
     ┌──────────────┐
     │   Angular    │  → SPA (components, services, signals)
     └──────┬───────┘
       HTTP (JSON) sob /api
          │
     ┌────▼─────┐
     │Controller│  → expõe os endpoints REST, valida o payload
     └────┬─────┘
     ┌────▼─────┐
     │ Service  │  → regras de negócio (conflito, capacidade, status, 2h)
     └────┬─────┘
     ┌────▼─────┐
     │Repository│  → Spring Data JPA (consultas de conflito/disponibilidade)
     └────┬─────┘
     ┌────▼─────┐
     │  MySQL   │  → persistência
     └──────────┘
```

**Padrões e princípios aplicados:**

- **DTO Pattern** — entrada/saída via `records` dedicados, sem expor as entidades JPA.
- **Repository Pattern** — abstração de acesso a dados com Spring Data.
- **Dependency Injection** — injeção por construtor (favorece imutabilidade e testabilidade).
- **Separação de responsabilidades** — controllers finos, regras concentradas nos services.
- **Tratamento centralizado de exceções** — `@RestControllerAdvice` traduz erros em JSON.
- **SOLID / Clean Code** — nomes descritivos, funções coesas, baixo acoplamento entre camadas.

---

## ▶️ Como executar

### Pré-requisitos

- **JDK 17+** — <https://adoptium.net/> (ou `winget install EclipseAdoptium.Temurin.17.JDK`)
- **Docker Desktop** — para subir o MySQL (ou um MySQL 8+ instalado localmente)

> **Maven e Node não são necessários.** O projeto inclui o *Maven Wrapper* (`mvnw`/`mvnw.cmd`),
> e o `frontend-maven-plugin` baixa uma cópia local do Node/npm em `frontend/node` para compilar
> o Angular. Um único comando levanta tudo.

### Passo a passo

**1. Suba o banco (MySQL via Docker):**

```bash
docker compose up -d
```

Isso cria o container `reservas-mysql` (MySQL 8.4, usuário `root`/`root`, banco `reservas`, porta 3306).
Confira com `docker ps` — deve aparecer como `healthy`.

**2. Rode a aplicação:**

```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

Na primeira execução, o Maven baixa o Node, roda `npm install` e compila o Angular
(o bundle é gerado em `src/main/resources/static/` e servido pelo Spring). Pode levar alguns minutos.
Para pular o build do front quando ele já estiver compilado:

```bash
.\mvnw.cmd "-Dfrontend.skip=true" spring-boot:run
```

**3. Acesse:**

- **Aplicação:** <http://localhost:8080/>

**4. Faça login** com um dos usuários de demonstração (criados automaticamente no seed):

| Usuário | Senha | Papel |
|---------|-------|-------|
| `Th` | `AdminTh@01` | ADMIN (acesso total + gestão de restaurantes) |
| `cantina` | `Cantina@01` | RESTAURANTE (Cantina da Nona) |
| `sushi` | `Sushi@01` | RESTAURANTE (Sushi Duranium) |

> ⚠️ Credenciais de **demonstração** — as senhas são armazenadas como hash BCrypt.
> Em produção, troque a senha do admin via propriedade `app.seed.admin-senha` e defina
> um segredo JWT forte via variável de ambiente `JWT_SECRET`.

> **Credenciais:** o app conecta como `root`/`root` por padrão. Se a senha do seu MySQL for outra,
> defina antes de rodar: `DB_USER` e `DB_PASSWORD` (variáveis de ambiente) — ou edite
> `src/main/resources/application.properties`.

> O banco **persiste** os dados entre reinícios (`ddl-auto=update`). O seed (`data.sql`) usa
> `INSERT IGNORE`, então é inserido uma única vez e não duplica a cada boot.

### Rodar pela IDE

Abra a pasta no **IntelliJ IDEA** ou **VS Code** (extensões Java) e execute a classe
`ReservasApplication`. A IDE já traz o Maven embutido.

### Desenvolvimento do front-end (hot reload)

Para iterar no Angular com recarregamento automático, rode os dois lados separadamente
(aqui sim é preciso ter o **Node 18+** instalado):

```bash
# terminal 1 — back-end
.\mvnw.cmd "-Dfrontend.skip=true" spring-boot:run

# terminal 2 — front-end
cd frontend
npm install
npm start
```

O app de desenvolvimento fica em <http://localhost:4200>, e o `proxy.conf.json` encaminha
as chamadas `/api` para o back-end na porta 8080 — por isso não há CORS.

### Inspecionar o banco no DataGrip

Com o container no ar (`docker compose up -d`):

1. **File → New → Data Source → MySQL**.
2. No campo **Driver**, se estiver *"Not downloaded"*, clique em **Download**.
3. Preencha: **Host** `localhost` · **Port** `3306` · **User** `root` · **Password** `root` ·
   **Database** `reservas` (a URL vira `jdbc:mysql://localhost:3306/reservas`).
4. **Test Connection** → *Succeeded* → **OK**.
5. Expanda **reservas → tables** para ver `restaurantes`, `mesas`, `clientes`, `reservas`.

---

## 🔌 Endpoints principais

> Toda a API fica sob o prefixo **`/api`**. As rotas de raiz ficam reservadas ao roteador do
> front-end (SPA), evitando colisão entre, por exemplo, a tela `/reservas` e o endpoint da API.
>
> **Autenticação:** exceto `/api/auth/login`, todas as rotas exigem o header
> `Authorization: Bearer <token>`. Logins de restaurante são automaticamente limitados aos
> próprios dados; tentativas fora do escopo retornam **403**.

| Método | Rota | Descrição |
|--------|------|-----------|
| POST  | `/api/auth/login` | Autenticar (`{username, senha}` → token JWT) |
| GET   | `/api/auth/me` | Dados da sessão atual |
| POST  | `/api/restaurantes` | Criar restaurante **+ login dele** (só ADMIN) |
| GET   | `/api/restaurantes` | Listar restaurantes (só ADMIN) |
| GET   | `/api/restaurantes/{id}` | Detalhar restaurante |
| GET   | `/api/restaurantes/{restauranteId}/mesas` | Listar mesas do restaurante |
| GET   | `/api/restaurantes/{restauranteId}/disponibilidade?data=&inicio=&fim=` | Disponibilidade de mesas |
| POST  | `/api/mesas` | Cadastrar mesa/sala |
| POST  | `/api/clientes` | Cadastrar cliente |
| GET   | `/api/clientes` | Listar clientes |
| POST  | `/api/reservas` | Criar reserva (status inicial `AGENDADA`) |
| GET   | `/api/reservas?data=&status=` | Listar reservas (filtros opcionais) |
| GET   | `/api/reservas/{id}` | Detalhar reserva |
| PATCH | `/api/reservas/{id}` | Atualizar status da reserva |

### Exemplo — criar reserva

```bash
curl -X POST http://localhost:8080/api/reservas \
  -H "Content-Type: application/json" \
  -d '{
        "clienteId": 1,
        "mesaId": 12,
        "dataReserva": "2026-07-20",
        "horaInicio": "19:30",
        "horaFim": "21:30",
        "pessoas": 4,
        "observacao": "Aniversario"
      }'
```

### Exemplo — atualizar status

```bash
curl -X PATCH http://localhost:8080/api/reservas/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"CONFIRMADA"}'
```

---

## 🗂️ Estrutura do projeto

```
.
├── docker-compose.yml              # MySQL 8.4 containerizado
├── pom.xml                         # dependências e build (Maven + build do Angular)
├── mvnw / mvnw.cmd / .mvn/         # Maven Wrapper (baixa o Maven sozinho)
├── frontend/                       # SPA Angular (TypeScript)
│   ├── angular.json                # build emite direto em src/main/resources/static
│   ├── proxy.conf.json             # dev: encaminha /api para :8080
│   └── src/app/
│       ├── core/models/            # interfaces espelhando os DTOs do back
│       ├── core/services/          # HttpClient por recurso
│       ├── core/interceptors/      # tratamento centralizado de erros da API
│       ├── features/               # telas (reservas, disponibilidade, mesas…)
│       └── shared/                 # componentes reutilizáveis (badge, toast…)
└── src/main/
    ├── java/io/duranium/reservas/
    │   ├── ReservasApplication.java   # ponto de entrada
    │   ├── config/         # configuração web (prefixo /api, fallback SPA)
    │   ├── model/          # entidades JPA + enums (Restaurante, Mesa, Cliente, Reserva…)
    │   ├── repository/     # Spring Data JPA (consultas de conflito e disponibilidade)
    │   ├── dto/            # records de request/response
    │   ├── service/        # regras de negócio
    │   ├── controller/     # endpoints REST
    │   └── exception/      # exceções de domínio + handler global
    └── resources/
        ├── application.properties   # configuração (datasource MySQL, JPA…)
        ├── data.sql                 # dados de exemplo (seed idempotente)
        └── static/                  # bundle do Angular (gerado no build, não versionado)
```

---

## 🔮 Possíveis melhorias futuras

- 🔐 **Autenticação e autorização** com Spring Security + JWT (perfis restaurante/cliente).
- 📚 **Documentação interativa** da API com Swagger/OpenAPI (springdoc).
- ✅ **Testes automatizados** — JUnit 5 + Mockito (unitários) e Testcontainers (integração com MySQL real).
- 🗃️ **Migrations** versionadas com Flyway ou Liquibase (em vez de `ddl-auto`).
- 🔁 **CI/CD** com GitHub Actions (build + testes a cada push).
- 🔔 Lembretes automáticos, avaliações de restaurante, relatórios de ocupação, cupons e pagamentos online.
- 📄 **Paginação e ordenação** nas listagens.

---

## 📝 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [`LICENSE`](LICENSE) para mais detalhes.
