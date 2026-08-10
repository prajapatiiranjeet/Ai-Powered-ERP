# Ai-Powered-ERP

## Overview

`Ai-Powered-ERP` is a Java Spring Boot application for an ERP-style system that manages users, students, faculty, departments, courses, and authentication.

The project is currently in development. Basic structure and backend flow are present, but it is not yet a finished application.

## What is in the project so far

- Spring Boot application with main class `com.chaiorcode.mycode.MycodeApplication`
- Spring Boot version: `4.1.0`
- Java version: `21`
- PostgreSQL as the target database
- Spring Data JPA for persistence
- Spring Security with JWT authentication
- Controllers for authentication, admin actions, student actions, and faculty actions
- DTOs, Entities, Repositories, Services, and basic security setup

## Current backend flow

1. `MycodeApplication` starts the Spring Boot app.
2. Spring scans `com.chaiorcode.mycode` packages for controllers, services, repositories, and configuration.
3. Database connection is configured in `src/main/resources/application.properties` using PostgreSQL.
4. JWT-based authentication is used for login and protected endpoints.

## Main endpoints implemented

### Authentication
- `POST /auth/login`
  - Accepts email/password in `LoginDTO`
  - Returns a JWT token in `LoginResponceDTO`

### Admin-related actions
- `POST /admin/register-admin`
- `POST /admin/register-faculty`
- `POST /admin/register-student`
- `PUT /admin/student-update`
- `PUT /admin/change-password`
- `GET /admin/get-all-students`
- `DELETE /admin/student-delete`
- `POST /admin/update_department`
- `POST /admin/insert-course`

### Student-related actions
- `PUT /students/update`
- `PUT /students/student-change-password`
- `GET /students/view-profile`

### Faculty-related actions
- `PUT /faculty/faculty-update`
- `PUT /faculty/faculty-change-password`

## How to set up locally

1. Install Java 21.
2. Install PostgreSQL and create a database, for example `postgres`.
3. Update `src/main/resources/application.properties` with your PostgreSQL credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=asdfghjkl
```

4. Run the application with Maven:

On Windows:
```powershell
./mvnw.cmd spring-boot:run
```

On macOS/Linux:
```bash
./mvnw spring-boot:run
```

5. Use a REST client or frontend to call the authentication endpoint and send the JWT token in the `Authorization: Bearer <token>` header for protected endpoints.

## Notes on current status

- The project is not complete yet.
- Authentication and role-based endpoints exist, but more features and frontend integration are still missing.
- The backend currently focuses on user registration, updates, and role-protected API scaffolding.

## Next improvements

- Add a frontend or UI for login and management.
- Complete missing service logic and controller endpoints.
- Add better error handling and validation.
- Secure JWT secret and configuration for production.

## GitHub push instructions

Since your repository already has `origin` configured as `https://github.com/prajapatiiranjeet/Ai-Powered-ERP.git` and the current branch is `main`, use these commands:

```bash
git add README.md
git commit -m "Add project README"
git push origin main
```

If you ever need to initialize a new repository from scratch, these are the commands:

```bash
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/prajapatiiranjeet/Ai-Powered-ERP.git
git push -u origin main
```

## Helpful notes

- Keep `jwt.secret` secure and do not commit production secrets.
- Update this README as the project develops.
- Add a frontend or API documentation later for easier testing.
