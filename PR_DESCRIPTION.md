# 🚀 Pull Request: Implementing Academic Roles & Unified Profile Management

## 📝 Overview & Objective
This PR implements a robust, scalable **User Roles (Admin, Student, Teacher) & Profile Management Module** using clean architecture patterns (DDD, Inverted Repositories, Domain Events). Additionally, it addresses codebase cleanup by refactoring the exception handling pipeline, resolving code duplication in authentication responses, and unifying account authentication details with role-specific student/teacher profile data.

---

## 🔑 Key Engineering Changes

### 1. 🗄️ Database & Schema Layer
*   **Profiles & Schema Relationships:** Introduced `StudentProfile` and `TeacherProfile` models to the Prisma schema, fully mapping them to the `User` table with a clean `1:1` cascading relationship.
*   **Role Migration:** Added `Role` enum (`ADMIN`, `STUDENT`, `TEACHER`) at the database level.
*   **Schema Migrations:** Successfully created and executed database schema migrations:
    *   `20260803134734_add_student_and_teacher_profiles_with_relations_to_user`
    *   `20260804160600_update_student_id_code`

### 2. 🔐 Authentication & Access Authorization
*   **Guard-Based Security:** Created custom `RolesGuard` and `@Roles(...)` metadata decorators validating endpoint operations against verified user tokens.
*   **Role Management:** Developed `UpdateUserRoleHandler` allowing authorized `ADMIN` accounts to safely transition user access roles.
*   **Unified Account & Profiles:** Integrated relational loading in `PrismaUserRepository` so that fetching users automatically `include`-joins active profiles. 
*   **Token Payload Enhancements:** Synchronized the token-generation lifecycle to include the user's role in the JWT session, facilitating client-side state handling.

### 3. 👥 Profiles Domain & Application Module
*   **Modular Architecture:** Created the complete `profiles` feature block (`src/modules/profiles`), housing Student and Teacher domain entities, mappers, repositories, handlers, and controllers.
*   **Core-Profile Consolidation:** Merged `/auth/me` and `/profiles/me` into a single, unified query handler (`GetMyProfileHandler`). Calling `GET /profiles/me` returns core account credentials alongside their specialized academic profile block (or `null` if the profile has not yet been initialized), optimizing browser load and onboarding state verification.

### 4. 🧹 Exception Refactoring & Code Cleanup
*   **Generic Exceptions:** Deprecated module-specific exceptions (`UserAlreadyExistException`, `UserNotFoundException`) in favor of centralized generic domain exceptions (`AlreadyExistDomainException`, `NotFoundDomainException`).
*   **Typo Refactoring:** Corrected the file name `not-dound-domain.exception.ts` to `not-found-domain.exception.ts` across **all 20 import statements** in handlers, specs, and integration pipelines.
*   **Git Cleanup:** Removed obsolete `.agents/` skill directories from git-tracking via `.gitignore`.

### 5. 🧪 Quality Assurance & Test Coverage
*   **E2E Profile Suite:** Created `test/profiles.e2e-spec.ts` testing the profiles module under realistic auth-guard scenarios.
*   **Test Suite Alignment:** Updated and aligned all unit tests and e2e suites to account for:
    *   Generic domain exception assertions.
    *   The unified `UserResponseDto` response envelope containing the `profile` key.
*   **Test Results:** **149/149 unit, integration, and E2E tests** are fully compiling and passing with zero ESLint errors!

---

## 🔌 Updated API Endpoints Summary

| Method | Endpoint | Auth Required | Access Level | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | No | Anonymous | Registers a new user, sends verification OTP |
| `POST` | `/auth/verify-email` | No | Anonymous | Verifies email using 6-digit OTP code |
| `POST` | `/auth/login` | No | Anonymous | Authenticates user, returns tokens with unified profile block |
| `POST` | `/auth/refresh` | No | Anonymous | Rotates refresh tokens and returns fresh session state |
| `PATCH` | `/auth/users/:userId/role` | Yes (Bearer) | `ADMIN` | Updates a target user's authorization role |
| `GET` | `/profiles/me` | Yes (Bearer) | `ANY` | Retrieves unified logged-in account and profile details |
| `POST` | `/profiles/student` | Yes (Bearer) | `STUDENT` | Initializes a student profile for the current user |
| `PATCH` | `/profiles/student` | Yes (Bearer) | `STUDENT` | Updates active student profile parameters |
| `POST` | `/profiles/teacher` | Yes (Bearer) | `TEACHER` | Initializes a teacher profile for the current user |
| `PATCH` | `/profiles/teacher` | Yes (Bearer) | `TEACHER` | Updates active teacher profile parameters |

---

## 🔀 Commit-by-Commit Log

1. `2ceacdc` `docs: update README with profiles endpoints and roles system`
2. `30599a9` `test(profiles): add comprehensive profiles module e2e test suite`
3. `0a2d07b` `test(profiles): update getMyProfile controller spec assertions for unified response schema`
4. `a6535a1` `fix(profiles): make interests property optional in CreateStudentProfileDto`
5. `0799701` `refactor(auth): unify auth responses with role-specific profiles`
6. `d144aa1` `build: add .agents directory to .gitignore`
7. `af84652` `test(auth): clean up test assertions and remove obsolete exception files`
8. `df6e211` `refactor(auth): replace specific auth exceptions with generic domain exceptions`
9. `9db2a81` `feat(auth): integrate user roles support in user entity, mapper, and controller`
10. `2b92fd1` `feat(profiles): implement student and teacher profile creation and update handlers`
11. `8b7b0d2` `feat(auth): implement update user role command handler and DTO`
12. `680c1fa` `feat(auth): add RolesGuard with custom roles decorator validation`
13. `7d5c115` `feat(auth): add roles decorator, enums, and shared already-exists domain exception`
14. `c3c0c05` `feat(database): add student and teacher profiles schema migrations`
