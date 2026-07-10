# Via Appia — Sistema de Gestão de Demandas

Aplicação full stack para criação, acompanhamento e organização de demandas internas em formato de mural de avisos.

O projeto foi desenvolvido como desafio técnico, com backend em Spring Boot, frontend em Angular, autenticação JWT, persistência em PostgreSQL, documentação via Swagger e versionamento de banco com Flyway.

## Funcionalidades

- Autenticação e cadastro de usuários com JWT
- Criação, listagem, edição e exclusão de demandas
- Filtros por título, status, prioridade e categoria
- Mudança de status: aberta, em andamento, resolvida e fechada
- Reabertura de demandas resolvidas
- Comentários vinculados às demandas
- Paginação e ordenação no backend
- Cache com Caffeine
- Documentação OpenAPI/Swagger
- Banco PostgreSQL versionado com Flyway
- Interface responsiva em formato de mural de avisos

## Tecnologias

### Backend

- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- PostgreSQL
- Flyway
- Caffeine Cache
- Swagger / OpenAPI
- Maven
- Lombok

### Frontend

- Angular
- TypeScript
- Reactive Forms
- Angular Router
- HttpClient
- CSS responsivo

### Infraestrutura

- Docker
- PostgreSQL 16
- Git e GitHub

## Arquitetura

O backend segue uma separação em camadas:

```text
controller
dto
entity
exception
mapper
repository
security
service
specification
```

O frontend está organizado em:

```text
core
  guards
  interceptors
  models
  services

pages
  login
  dashboard
```

## Requisitos

- Java 21
- Node.js
- Angular CLI
- Docker Desktop
- Git

## Banco de dados

Configuração padrão:

```text
Banco: incident_management
Usuário: viaappia
Senha: viaappia123
Porta: 5432
```

Consulte o container em execução com:

```bash
docker ps
```

## Executando o backend

```bash
cd backend
```

No Windows:

```cmd
.\mvnw.cmd spring-boot:run
```

No Linux ou macOS:

```bash
./mvnw spring-boot:run
```

Backend:

```text
http://localhost:8080
```

## Executando o frontend

```bash
cd frontend
npm install
ng serve
```

Frontend:

```text
http://localhost:4200
```

## Swagger

```text
http://localhost:8080/swagger-ui/index.html
```

Para testar endpoints protegidos:

1. Faça login.
2. Copie o token JWT.
3. Clique em `Authorize`.
4. Informe `Bearer SEU_TOKEN`.

## Credenciais de demonstração

```text
E-mail: admin@viaappia.com
Senha: Admin@123
```

> Altere essas credenciais em ambientes públicos ou de produção.

## Fluxo das demandas

```text
OPEN
  ↓
IN_PROGRESS
  ↓
RESOLVED
```

Uma demanda resolvida pode ser reaberta.

Status:

- `OPEN`
- `IN_PROGRESS`
- `RESOLVED`
- `CLOSED`

Prioridades:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

Categorias:

- `HARDWARE`
- `SOFTWARE`
- `NETWORK`
- `SECURITY`
- `OTHER`

## Endpoints principais

### Autenticação

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Demandas

```http
GET    /api/v1/incidents
GET    /api/v1/incidents/{id}
POST   /api/v1/incidents
PUT    /api/v1/incidents/{id}
DELETE /api/v1/incidents/{id}
```

A listagem aceita:

```text
title
status
priority
category
page
size
sort
```

### Comentários

```http
GET  /api/v1/incidents/{incidentId}/comments
POST /api/v1/incidents/{incidentId}/comments
```

Exemplo:

```json
{
  "message": "Equipamento encaminhado para manutenção."
}
```

O autor do comentário é obtido pelo backend a partir do usuário autenticado.

## Migrations

```text
backend/src/main/resources/db/migration
```

```text
V1__create_incidents.sql
V2__create_users_and_roles.sql
V3__create_comments.sql
```

> Não altere migrations já executadas em um banco compartilhado. Crie uma nova versão para mudanças futuras.

## Cache

Caches configurados:

```text
incidents
incidentById
stats
commentsByIncident
```

Operações de escrita invalidam os caches relacionados.

## Segurança e validação

- Autenticação JWT
- Rotas protegidas
- Validação de DTOs
- Tratamento de erros HTTP
- Autor de comentário definido pelo backend
- Confirmação antes da exclusão
- Bloqueio de ações duplicadas no frontend
- Exclusão em cascata dos comentários de uma demanda

## Build e testes

Backend:

```cmd
cd backend
.\mvnw.cmd clean test
```

Frontend:

```cmd
cd frontend
ng build
```

## Estrutura resumida

```text
incident-management-system/
├── backend/
│   ├── src/main/java/com/viaappia/incident/
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/
│   ├── public/icons/
│   ├── src/app/
│   ├── angular.json
│   └── package.json
└── README.md
```

## Decisões técnicas

### DTOs separados

Os contratos de entrada e saída são separados das entidades para evitar exposição do modelo interno e centralizar validações.

### Mapper

Os mappers centralizam conversões e normalização de dados, reduzindo duplicação.

### Specification

Os filtros usam `Specification`, permitindo combinar parâmetros opcionais sem duplicar consultas.

### JWT

A autenticação é stateless e adequada à separação entre frontend e backend.

### Flyway

O schema do banco é reproduzível e versionado.

### Caffeine

O cache melhora consultas frequentes sem exigir infraestrutura externa adicional.

## Melhorias futuras

- Painel de estatísticas
- Paginação completa no frontend
- Ordenação configurável na interface
- Separação entre perfil leitor e escritor
- Testes unitários e de integração adicionais
- Docker Compose para frontend, backend e banco
- Edição e exclusão de comentários

## Roteiro de demonstração

1. Abrir a aplicação.
2. Fazer login.
3. Apresentar o mural.
4. Criar uma demanda.
5. Editar a demanda.
6. Iniciar o atendimento.
7. Concluir a demanda.
8. Reabrir a demanda.
9. Adicionar um comentário.
10. Aplicar filtros.
11. Excluir uma demanda.
12. Mostrar o Swagger.
13. Explicar JWT, Flyway, cache e arquitetura.

## Autor

Desenvolvido por Abduh para o desafio técnico Full Stack da Via Appia.
