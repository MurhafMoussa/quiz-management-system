# Quiz Management System — Core Authentication & Backend Service

> An enterprise-grade, highly scalable backend service built with **NestJS**, **TypeScript**, **Prisma v7**, and **PostgreSQL**, showcasing **Domain-Driven Design (DDD)**, **Hexagonal/Clean Architecture**, and **Zero-Trust Token Security**.

---

## 🌟 Key Engineering Features

- **Rich Domain Model (DDD)**: Fully encapsulated domain entities (`User`) with private state, explicit business rules (`changeRefreshToken`, `touch`), and domain-driven persistence contracts.
- **Inverted Repository Pattern**: Abstract `UserRepository` interfaces decoupling application logic from ORM and database implementations (`PrismaUserRepository`).
- **Zero-Trust Refresh Token Security**: DB stores Argon2id-hashed refresh tokens rather than raw tokens, mitigating session hijacking in the event of a database breach.
- **UUID v7 Primary Keys**: Time-sortable 128-bit identifiers optimizing PostgreSQL B-Tree index locality while avoiding auto-increment enumeration risks.
- **Unified API Response Envelopes**: Interceptor-driven HTTP responses wrapping data in clean `{ success: true, data: ..., message: ... }` contracts.
- **i18n & Domain Exception Mapping**: Centralized exception filters transforming domain errors into localized, client-friendly error payloads via `nestjs-i18n` and `Zod`.
- **Multi-Stage Dockerization**: Production-ready multi-stage Docker build utilizing `node:22-alpine` for minimal container footprint and zero dev-dependency leakage.
- **Comprehensive Test Suite**: Unit, Integration, and End-to-End (E2E) testing with Jest and Supertest.

---

## 📐 Architecture & System Design

The application strictly adheres to **Clean Architecture** and **Domain-Driven Design (DDD)**, separating concerns across four isolated layers:

```
                  ┌─────────────────────────────────────────┐
                  │            Presentation Layer           │
                  │   (Controllers, Guards, Interceptors)   │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │            Application Layer            │
                  │      (Use Cases / Command Handlers)     │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │              Domain Layer               │
                  │   (Rich Entities, Value Objects, Interfaces)  │
                  └────────────────────▲────────────────────┘
                                       │
                                       │ (Implements Interfaces)
                  ┌────────────────────┴────────────────────┐
                  │           Infrastructure Layer          │
                  │  (Prisma, Argon2, JWT, UUID v7 Services)│
                  └─────────────────────────────────────────┘
```

---

### 1. Architectural Layers & Dependency Inversion

```mermaid
graph TD
    subgraph Presentation Layer [Presentation Layer - HTTP / NestJS]
        AC[AuthController]
        AG[AuthGuard]
        RTI[ResponseTransformerInterceptor]
        DEF[DomainExceptionFilter]
    end

    subgraph Application Layer [Application Layer - Use Cases]
        RH[RegisterHandler]
        LH[LoginHandler]
        RTH[RefreshTokenHandler]
        GCU[GetCurrentUserHandler]
    end

    subgraph Domain Layer [Domain Layer - Core Business Rules]
        UE[User Domain Entity]
        URI[(IUserRepository Interface)]
        HSI[(IHasher Interface)]
        TSI[(ITokenService Interface)]
        IDG[(IIdGenerator Interface)]
    end

    subgraph Infrastructure Layer [Infrastructure Layer - Concrete Adapters]
        PUR[PrismaUserRepository]
        UM[UserMapper]
        ASH[ArgonStringHasher]
        JWT[JwtService]
        UUID[UuidV7Generator]
    end

    AC --> RTH
    RTH --> UE
    RTH --> URI
    RTH --> HSI
    RTH --> TSI

    PUR -. Implements .-> URI
    PUR --> UM
    ASH -. Implements .-> HSI
    JWT -. Implements .-> TSI
    UUID -. Implements .-> IDG
```

---

### 2. Secure Refresh Token Rotation Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Controller as AuthController
    participant Handler as RefreshTokenHandler
    participant User as User Entity (Domain)
    participant Repo as PrismaUserRepository
    participant DB as PostgreSQL

    Client->>Controller: POST /auth/refresh { refreshToken }
    Controller->>Handler: handle(oldRefreshToken)
    Handler->>Repo: findById(userId)
    Repo->>DB: prisma.user.findUnique(...)
    DB-->>Repo: Raw DB User
    Repo-->>Handler: Rehydrated User Domain Entity
    
    Handler->>Handler: hasher.compare(oldRefreshToken, user.refreshTokenHash)
    alt Token Mismatch or Revoked
        Handler-->>Controller: Throw InvalidRefreshTokenException
        Controller-->>Client: 401 Unauthorized (Unified Error Envelope)
    else Token Valid
        Handler->>Handler: tokenService.generateTokens(...)
        Handler->>User: user.changeRefreshToken(newHash)
        Note over User: Mutates private state & touches updatedAt timestamp
        Handler->>Repo: userRepository.save(user)
        Repo->>DB: prisma.user.upsert(...)
        Handler-->>Controller: AuthResponseDto
        Controller-->>Client: 200 OK (Transformed API Success Envelope)
    end
```

---

### 3. Request Execution & Exception Pipeline

```mermaid
flowchart LR
    Req[HTTP Request] --> Guard[AuthGuard / JWT Strategy]
    Guard --> ZodFilter[Zod Validation Filter]
    ZodFilter --> Controller[AuthController]
    Controller --> Handler[Application Use Case Handler]
    Handler --> Domain[Rich Domain Entity & Invariants]
    
    Domain -- Throws Exception --> DomainFilter[DomainException Filter]
    DomainFilter --> JsonErr[Unified Error Envelope { success: false, error: ... }]
    
    Handler -- Success --> Interceptor[ResponseTransformer Interceptor]
    Interceptor --> JsonOk[Unified Success Envelope { success: true, data: ... }]
```

---

## 🛠️ Technical Highlights & Design Decisions

### Why Rich Domain Model over Anemic DTOs?
In typical CRUD applications, entities are passive data structures. In this service, `User` encapsulates private fields (`_username`, `_passwordHash`, `_refreshTokenHash`) and exposes domain behaviors (`changeRefreshToken`, `changePassword`, `clearRefreshToken`). State mutations automatically update `updatedAt` timestamps, guaranteeing domain integrity across all use cases.

### Why Persistence Ignorance (`save` pattern)?
Rather than exposing database-specific methods like `updateRefreshTokenHash` in repository interfaces, the persistence contract is simplified to `save(user: User): Promise<User>`. The `PrismaUserRepository` utilizes `UserMapper.toPersistence` to convert domain aggregates into database models seamlessly via `upsert`.

### Why Argon2 for Refresh Token Hashing?
Refresh tokens act as credentials with extended lifespans. Storing plaintext or reversibly encrypted tokens in a database exposes users if database dumps are compromised. Argon2id provides memory-hard, GPU-resistant hashing for refresh tokens.

### Why UUID v7 over UUID v4 / Auto-Increment IDs?
Auto-increment integers leak row volume and enable sequential scraping attacks. Standard UUID v4 IDs are purely random, causing high index fragmentation in PostgreSQL B-Trees. UUID v7 embeds millisecond-precision timestamps in the high-order bits, providing chronological ordering and high write performance for database indexes.

---

## 📁 Directory Structure

```
src/
├── config/                  # Environment validation & Zod schemas
├── modules/
│   └── auth/
│       ├── application/     # Use Cases, Handlers, DTOs & Validation Schemas
│       ├── domain/          # Entities, Domain Interfaces, Exceptions
│       ├── infrastructure/  # Repositories, Mappers, JWT & Hashing Services
│       └── presentation/    # Controllers, Guards, Custom Decorators
└── shared/
    ├── domain/              # Common Domain Interfaces & Base Exceptions
    ├── infrastructure/      # Prisma DB Service, UUID v7 Generator
    └── presentation/        # Exception Filters, Response Transformer Interceptors
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 20.x` or `22.x`
- **npm**: `>= 10.x`
- **Docker**: For containerized database and runtime testing

### Environment Setup
Create a `.env` file in the root directory (refer to `.env.example`):

```env
PORT=3000
NODE_ENV=development

# PostgreSQL Connection
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgrespassword
POSTGRES_DB=quiz_db
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/quiz_db?schema=public

# Authentication Secrets & Expirations
JWT_ACCESS_TOKEN_SECRET=your-super-secret-jwt-access-token-key
JWT_REFRESH_TOKEN_SECRET=your-super-secret-jwt-refresh-token-key
JWT_ACCESS_TOKEN_EXPIRATION_MS=30000
JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000
```

### Installation & Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL container via Docker Compose
docker compose up -d

# 3. Generate Prisma Client
npx prisma generate

# 4. Run database migrations
npx prisma migrate dev

# 5. Start the development server
npm run start:dev
```

The server will start at `http://localhost:3000`.  
Access interactive Swagger API documentation at **`http://localhost:3000/docs`**.

---

## 🐳 Docker Deployment & Container Testing

The application includes a multi-stage production **`Dockerfile`**:

```bash
# 1. Build production Docker image
docker build -t quiz-management-server .

# 2. Run container using local .env
docker run -d --name quiz-app -p 3000:3000 --env-file .env quiz-management-server

# 3. View container logs
docker logs -f quiz-app

# 4. Cleanup test container
docker stop quiz-app && docker rm quiz-app
```

---

## 🧪 Testing Suite

```bash
# Run all unit and integration tests
npm run test

# Run test coverage report
npm run test:cov

# Run integration tests
npm run test:integration

# Run end-to-end (E2E) tests
npm run test:e2e
```

---

## 🔄 CI/CD Pipeline & Secrets Strategy

Automated quality control is managed via **GitHub Actions** (`.github/workflows/ci.yml`):

- **Local Environment**: Uses `.env` file (gitignored).
- **CI Environment**: Injected dynamically from **GitHub Repository Secrets**:

| Secret Name | Recommended Value for GitHub Secrets |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgrespassword@localhost:5432/quiz_management_test?schema=public` |
| `JWT_ACCESS_TOKEN_SECRET` | `your-super-secret-jwt-access-token-key-min-32-chars` |
| `JWT_REFRESH_TOKEN_SECRET` | `your-super-secret-jwt-refresh-token-key-min-32-chars` |
| `JWT_ACCESS_TOKEN_EXPIRATION_MS` | `30000` |
| `JWT_REFRESH_TOKEN_EXPIRATION_MS` | `604800000` |
| `PORT` | `3000` |

**Pipeline Steps**:
1. Provisions PostgreSQL 16 container service.
2. Runs Prisma migrations (`npx prisma migrate deploy`).
3. Executes ESLint and TypeScript compilation (`npx tsc --noEmit`).
4. Executes unit & integration tests (`npm run test:cov`).
5. Verifies production build output (`npm run build`).
6. Verifies multi-stage production Docker image build (`docker build`).

---

## 📄 License

This project is [UNLICENSED](LICENSE) / Proprietary software.
