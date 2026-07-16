# Mesa & Hora — Front-end de Reservas (Angular 18)

SPA standalone (signals, novo control flow, `inject()`) que consome a API Spring Boot em `/api`.

## Desenvolvimento
```bash
npm install
npm start        # ng serve em http://localhost:4200 (proxy /api -> :8080)
```

## Build de produção (servido pelo back-end)
```bash
npm run build:prod
```
O `outputPath` está configurado para `../src/main/resources/static`, assumindo o Angular em
`frontend/` na raiz do repositório Spring. Os arquivos finais (index.html, JS, CSS) caem na
raiz de `static/`, então o back serve o app na mesma origem (deep-link funciona pois o Spring
devolve o index.html para rotas desconhecidas).

## Estrutura
```
src/app/
  core/models        DTOs + union types (StatusReserva, TipoMesa) + ApiError
  core/services      um service por recurso + restaurante-ativo (signal) + toast
  core/interceptors  error.interceptor -> traduz o erro da API em ApiError
  core/util          format (datas pt-BR, overlap de horário)
  shared             status-badge, toast, empty-state, spinner
  features           reservas, disponibilidade, mesas, clientes, restaurantes
```