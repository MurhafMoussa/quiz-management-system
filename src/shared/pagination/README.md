# Generic Pagination & Query Filtering System

A powerful, custom, zero-dependency, type-safe, and ORM-agnostic pagination, filtering, sorting, and searching utility. This system is designed to work out-of-the-box with **Prisma** (with extensible adapter patterns for other ORMs) and is fully integrated into the shared application layer.

---

## 📂 Directory Structure

```
src/shared/pagination/
├── domain/
│   └── pagination.interfaces.ts         # Enums, generic types & structures
├── utils/
│   └── pagination-parser.utils.ts       # Parses query params into structured rules
├── infrastructure/
│   └── prisma-pagination.adapter.ts     # Maps rules into safe case-insensitive Prisma queries
└── presentation/
    └── pagination-query.dto.ts          # Zod query validator with dynamic catch-all support
```

---

## 🚀 Key Features

* **Type-Safe Generics:** Interfaces accept a generic entity parameter `<T>` (e.g., `User`) to enforce compile-time autocomplete and validation on filterable, searchable, and sortable fields.
* **Complex Operator Bracket Syntax:** Supports advanced field-level operator constraints out-of-the-box via request queries (e.g., `age[gte]=18`, `status[neq]=inactive`).
* **Nested Field Sorting & Filtering:** Supports relational dot-notation matching (e.g., filter on `StudentProfile.major` or sort by `StudentProfile.grade_level`).
* **Precise Sort Precedence:** Generates ordered arrays for database sorting to preserve the developer's requested column priority.
* **Case-Insensitive Searching:** Supports multi-field global searches compiled into clean `OR` clauses with insensitive modes.
* **Secure Whitelisting:** Prevents malicious queries by ignoring fields that are not explicitly whitelisted in the endpoint configuration.

---

## 🔍 Supported Operators

Query parameter syntax matches the format `field[operator]=value`. If no operator bracket is provided, it defaults to equality (`eq`).

| Query Operator | FilterOperator Enum | Prisma Compilation equivalent | Purpose | Example Query Parameter |
| :--- | :--- | :--- | :--- | :--- |
| **(None)** / `[eq]` | `FilterOperator.EQ` | `{ field: value }` | Exact Equality | `status=active` |
| `[neq]` | `FilterOperator.NEQ` | `{ field: { not: value } }` | Inequality | `status[neq]=inactive` |
| `[gt]` | `FilterOperator.GT` | `{ field: { gt: value } }` | Greater Than | `age[gt]=18` |
| `[gte]` | `FilterOperator.GTE` | `{ field: { gte: value } }` | Greater Than or Equal | `created_at[gte]=2026-08-01` |
| `[lt]` | `FilterOperator.LT` | `{ field: { lt: value } }` | Less Than | `age[lt]=65` |
| `[lte]` | `FilterOperator.LTE` | `{ field: { lte: value } }` | Less Than or Equal | `price[lte]=50.5` |
| `[contains]` | `FilterOperator.CONTAINS`| `{ field: { contains: value, mode: 'insensitive' } }` | Partial String Match | `name[contains]=john` |
| `[startsWith]`| `FilterOperator.STARTS_WITH`| `{ field: { startsWith: value, mode: 'insensitive' } }`| Prefix String Match | `email[startsWith]=admin` |
| `[endsWith]` | `FilterOperator.ENDS_WITH` | `{ field: { endsWith: value, mode: 'insensitive' } }`| Suffix String Match | `email[endsWith]=gmail.com` |
| `[in]` | `FilterOperator.IN` | `{ field: { in: [values] } }` | Contained in comma-list | `role[in]=ADMIN,TEACHER` |
| `[notIn]` | `FilterOperator.NOT_IN` | `{ field: { notIn: [values] } }` | Not contained in list | `role[notIn]=STUDENT` |

*Note: The parser automatically casts string values to `boolean` (`true`/`false`), `number` (floats and ints for range checks), or `Date` objects (valid ISO date formats containing `-` or `:`).*

---

## 💻 Code Examples

### 1. Presentation Layer (NestJS Controller)

Use `PaginationQueryDto` to capture, validate, and pass pagination and dynamic filter parameters from the request URL.

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/presentation/guards/auth.guard';
import { RolesGuard } from 'src/modules/auth/presentation/guards/roles.guard';
import { Roles } from 'src/modules/auth/presentation/decorators/roles.decorator';
import { Role } from 'src/shared/domain/enums/role.enum';
import { PaginationQueryDto } from 'src/shared/pagination/presentation/pagination-query.dto';
import { ListUsersHandler } from '../application/handlers/list-users.handler';

@Controller('users')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly listUsersHandler: ListUsersHandler) {}

  @Get()
  async getUsers(@Query() query: PaginationQueryDto) {
    return this.listUsersHandler.handle(query);
  }
}
```

---

### 2. Application Layer (CQRS Handler)

Define your `PaginationConfig<T>` to configure allowed searchable, sortable, and filterable fields. Call `PaginationParser.parse` to parse parameters, then paginate using `PrismaPaginationAdapter.paginate`.

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/services/prisma.service';
import { User } from 'src/generated/prisma/client';
import { PaginationConfig, SortOrder } from 'src/shared/pagination/domain/pagination.interfaces';
import { PaginationParser } from 'src/shared/pagination/utils/pagination-parser.utils';
import { PrismaPaginationAdapter } from 'src/shared/pagination/infrastructure/prisma-pagination.adapter';

@Injectable()
export class ListUsersHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(query: Record<string, any>) {
    // 1. Declare the type-safe pagination configuration for the User model
    const config: PaginationConfig<User> = {
      searchableFields: ['first_name', 'last_name', 'email'],
      filterableFields: ['role', 'is_verified', 'created_at'],
      sortableFields: ['created_at', 'first_name', 'last_name', 'email'],
      defaultSort: {
        field: 'created_at',
        order: SortOrder.DESC,
      },
      maxLimit: 50,
    };

    // 2. Parse the dynamic request query into structured type-safe PaginationParams
    const params = PaginationParser.parse<User>(query, config);

    // 3. Paginate the prisma client delegate in a single line of code!
    return PrismaPaginationAdapter.paginate<User>(
      this.prisma.user,
      params,
      {
        ...config,
        // (Optional) You can pass standard Prisma includes or selects here:
        include: {
          StudentProfile: true,
          TeacherProfile: true,
        }
      }
    );
  }
}
```

---

### 3. Example Request & Response Scenarios

#### Scenario A: Searching & Filtering
**Request URL:**
```http
GET /users?page=1&limit=2&search=john&is_verified=true&role[in]=TEACHER,ADMIN&sortBy=first_name&sortOrder=asc
```

**Parsed Object (`PaginationParams<User>`):**
```json
{
  "page": 1,
  "limit": 2,
  "search": "john",
  "filters": [
    { "field": "is_verified", "operator": "eq", "value": true },
    { "field": "role", "operator": "in", "value": ["TEACHER", "ADMIN"] }
  ],
  "sorts": [
    { "field": "first_name", "order": "asc" }
  ]
}
```

**Response Format (wrapped automatically by `ResponseTransformInterceptor`):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully.",
  "data": {
    "items": [
      {
        "id": "e0bfa3f0-4613-43ef-bc21-0a13ab0a76a8",
        "email": "john.teacher@school.com",
        "first_name": "John",
        "last_name": "Miller",
        "is_verified": true,
        "role": "TEACHER",
        "created_at": "2026-08-01T12:00:00.000Z",
        "TeacherProfile": {
          "title": "Professor",
          "department": "Mathematics"
        }
      },
      {
        "id": "bc33fa76-7c1a-4601-af91-45a9096ea351",
        "email": "john.admin@school.com",
        "first_name": "Johnny",
        "last_name": "Smith",
        "is_verified": true,
        "role": "ADMIN",
        "created_at": "2026-08-02T10:30:00.000Z",
        "TeacherProfile": null
      }
    ],
    "meta": {
      "total": 5,
      "page": 1,
      "limit": 2,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

## 🛠️ Testing

A complete suite of Jest unit tests is included to verify the reliability of the pagination parser and Prisma database adapters.

To run the pagination tests, use:
```bash
npm run test -- src/shared/pagination
```
