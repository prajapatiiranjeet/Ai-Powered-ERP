# ERP FRONTEND MASTER PLAN

---

# 1. PROJECT OVERVIEW

## What This ERP Frontend Is
This is a **React-based College ERP (Enterprise Resource Planning) frontend** built for an existing Spring Boot backend (Ai-Powered-ERP). The ERP manages three user roles: ADMIN, FACULTY, and STUDENT, with role-based access to academic management features.

## Purpose of the Application
- Centralized college management system
- Admin manages users (students, faculty), departments, courses
- Faculty manages their profile and teaching assignments
- Students view and update their profile, view academic information

## Frontend Technology
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Fetch API (native, no axios dependency)
- **State Management**: React Context + localStorage (minimal, no Redux)

## Backend Technology
- **Framework**: Spring Boot (Java)
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens) - 40 minute expiry
- **Password Hashing**: BCrypt
- **ORM**: Hibernate / JPA

## Frontend/Backend Separation
- **Backend folder**: `Ai-Powered-ERP/` — READ-ONLY. DO NOT MODIFY.
- **Frontend folder**: `frontend/` — All React code lives here.
- Communication via REST APIs over HTTP.
- Backend runs on port `8080` (default Spring Boot). Frontend runs on port `5173` (Vite default). CORS must be handled.

## Overall Architecture
```
┌──────────────────┐      HTTP/REST      ┌──────────────────┐
│   React Frontend │ ──────────────────→ │ Spring Boot Back │
│   (frontend/)    │ ←────────────────── │  (Ai-Powered-ERP)│
│  Port: 5173      │   JWT in Auth Header│  Port: 8080      │
└──────────────────┘                      └──────────────────┘
         │                                            │
    localStorage                                  PostgreSQL
  (token + user)                                (DB on localhost:5432)
```

---

# 2. BACKEND ANALYSIS

## Controllers (4 Total)

| Controller | Base Path | Purpose |
|---|---|---|
| `AuthController` | `/auth` | Login endpoint |
| `AdminController` | `/admin` | Admin operations: register users, manage students, dept, courses |
| `StudentController` | `/students` | Student profile view/update, password change |
| `FacultyController` | `/faculty` | Faculty profile update, password change |

## Services (8 Total)
`AuthService`, `StudentService`, `FacultyService`, `DepartmentService`, `CourseService`, `BatchService`, `SectionService`, `SubjectService`, `CustomUserDetailsService`

## Entities (8 Total)
`User`, `Student`, `Faculty`, `Department`, `Course`, `Branch`, `Batch`, `Section`

## Repositories (8 Total)
`UserRepo`, `StudentRepository`, `FacultyRepo`, `DepartmentRepository`, `CourseRepository`, `BranchRepo`, `BatchRepo`, `SectionRepository`

## DTOs (10 Total)
`LoginDTO`, `LoginResponceDTO`, `CreateUserDto`, `RegisterDTO`, `StudentDTO`, `FacultyRequestDTO`, `DepartmentDTO`, `CoursDTO`, `BatchResponseDTO`, `SectionResponseDTO`

## Security / Authentication
- **Stateless JWT authentication** (SessionCreationPolicy.STATELESS)
- **CSRF disabled** (REST API pattern)
- Passwords encoded with **BCrypt**
- JWT signed with HMAC-SHA using secret from `jwt.secret` property
- JWT contains: `sub` (email), `iat` (issued at), `exp` (40 min expiry)
- `JwtFilter` runs before `UsernamePasswordAuthenticationFilter`
- Roles are granted as `ROLE_<ROLENAME>` via `UserDetails.getAuthorities()`

## Important Enums

### Role Enum
```
ADMIN, FACULTY, STUDENT, STUDENTS
```
⚠️ **IMPORTANT**: Security config uses `hasAnyRole("ADMIN", "STUDENTS")` — the plural `STUDENTS` role, NOT `STUDENT`. When registering students, backend sets `Role.STUDENTS`.

### Gender Enum
```
MALE, FEMALE, OTHER
```

### Designation Enum
```
PROFESSOR, ASSOCIATE_PROFESSOR, ASSISTANT_PROFESSOR, HOD, LAB_ASSISTANT, LECTURER, GUEST_FACULTY
```

## Important Business Rules
1. **Student Registration**: Auto-generates roll number (`NIU-<userId>`), auto phone, auto batch/section assignment.
2. **Faculty Registration**: Auto-generates employee ID (`NIU-EMP-<userId>`).
3. **Section Capacity**: 60 students max per section; overflow creates new section.
4. **Batch Resolution**: Auto-resolved from department+course+branch combo.
5. **Username = Email**: Throughout the app, email is used as the username/identifier.
6. **User ↔ Student/Faculty**: One-to-one relationship. Every student/faculty has a corresponding `User` entity for auth.

---

# 3. AUTHENTICATION ARCHITECTURE

## Complete Login Flow (Step-by-Step)
```
User enters email + password on Login Page
         ↓
Frontend validates form (non-empty, email format)
         ↓
POST /auth/login  { email, password }  (PUBLIC, no auth needed)
         ↓
Backend: AuthenticationManager → CustomUserDetailsService → DB lookup → BCrypt password match
         ↓
Backend generates JWT token (40 min expiry, sub = email)
         ↓
Response: { id, jwt }  →  LoginResponceDTO
         ↓
Frontend stores:
  - token: localStorage["erp_token"]
  - userId: localStorage["erp_userId"]
  - email: (from JWT payload, decoded on client)
         ↓
FRONTEND ROLE DETECTION (see Section 18 - KNOWN LIMITATIONS)
  Backend login response does NOT include role.
  Frontend must infer role by calling protected endpoints:
    1. Try GET /admin/get-all-students → if 200 → ADMIN
    2. Try GET /students/view-profile → if 200 → STUDENT
    3. Otherwise → FACULTY (or error)
         ↓
Role stored in localStorage["erp_role"]
         ↓
Role-based redirect:
  ADMIN   → /admin/dashboard
  STUDENT → /student/dashboard
  FACULTY → /faculty/dashboard
```

## Login Request Details
```
POST /auth/login
Headers: Content-Type: application/json
Body:
{
  "email": "user@college.edu",
  "password": "********"
}
```

## Login Response Details
```
Status: 200 OK
Body:
{
  "id": 1,
  "jwt": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1p... (40 min valid JWT)"
}
```

## Token Handling
- **Storage**: localStorage key `erp_token`
- **Sending**: Every protected API request includes header:
  ```
  Authorization: Bearer <jwt_token>
  ```
- **Expiry**: 40 minutes from issuance. On 401 response, redirect to `/login`.
- **Logout**: Clear localStorage + redirect to `/login`.

## Role Handling
- **CRITICAL LIMITATION**: Backend login response does NOT return role.
- **Detection Strategy**: Post-login, probe role-specific endpoints.
- **Storage**: localStorage key `erp_role` (value: `ADMIN` | `STUDENT` | `FACULTY`)

## Logout Flow
```
User clicks "Logout"
  ↓
Clear localStorage: erp_token, erp_userId, erp_role, erp_email
  ↓
Redirect to /login
```

## Protected Routes
- React Router route guards (`ProtectedRoute` + `RoleGuard` components)
- Check for token existence + role match before render
- Unauthenticated → redirect `/login`
- Wrong role → redirect to correct dashboard or `/login`

## Unauthorized Behavior
- HTTP 401/403 → auto-logout + redirect `/login`
- Global HTTP interceptor catches these status codes

## Authentication Persistence
- Token + role in localStorage = session survives page refresh
- On app mount, check localStorage; re-validate token by hitting profile endpoint

---

# 4. ROLE & PERMISSION MATRIX

| Feature | ADMIN | STUDENT | FACULTY |
|---|:---:|:---:|:---:|
| Login via `/auth/login` | ✅ | ✅ | ✅ |
| Register Admin (`/admin/register-admin`) | ✅ | ❌ | ❌ |
| Register Faculty (`/admin/register-faculty`) | ✅ | ❌ | ❌ |
| Register Student (`/admin/register-student`) | ✅ | ❌ | ❌ |
| View ALL students (`/admin/get-all-students`) | ✅ | ❌ | ❌ |
| Update any student (`/admin/student-update`) | ✅ | ❌ | ❌ |
| Delete student (`/admin/student-delete`) | ✅ | ❌ | ❌ |
| Change any password (`/admin/change-password`) | ✅ | ❌ | ❌ |
| Create/Update Department (`/admin/update_department`) | ✅ | ❌ | ❌ |
| Insert Course (`/admin/insert-course`) | ✅ | ❌ | ❌ |
| View own profile (`/students/view-profile`) | ✅ | ✅ | ❌ |
| Update own student profile (`/students/update`) | ✅ | ✅ | ❌ |
| Student change own password (`/students/student-change-password`) | ✅ | ✅ | ❌ |
| Update faculty profile (`/faculty/faculty-update`) | ✅ | ❌ | ✅ |
| Faculty change own password (`/faculty/faculty-change-password`) | ✅ | ❌ | ✅ |

---

# 5. BACKEND API REFERENCE

## Authentication APIs

### Login
```
Feature: User Login
Endpoint: /auth/login
Method: POST
Authentication: PUBLIC (no auth)
Role: Any (public)
Request:
  {
    "email": "string (required)",
    "password": "string (required)"
  }
Response:
  {
    "id": "number (userId)",
    "jwt": "string (JWT token, 40min valid)"
  }
Errors:
  - 401 Unauthorized: Bad credentials
  - 500 Internal Server: Server error
Frontend usage: Login page → submit credentials → store token → detect role → redirect dashboard
```

---

## Admin APIs

### Register Admin
```
Feature: Create Admin User
Endpoint: /admin/register-admin
Method: POST
Authentication: PUBLIC (⚠️ per security config, permitAll)
Role: Public endpoint (but logically ADMIN should only use this)
Request:
  {
    "name": "string (2-50 chars)",
    "email": "string (valid email, unique)",
    "password": "string (required)",
    "createdAt": "datetime (optional)"
  }
Response:
  {
    "id": "number",
    "name": "string",
    "role": "ADMIN"
  }
Errors:
  - 400/500: Email duplicate or validation failure
Frontend usage: Admin → User Management → Create Admin
```

### Register Faculty
```
Feature: Create Faculty User
Endpoint: /admin/register-faculty
Method: POST
Authentication: PUBLIC (permitAll)
Role: Public endpoint (logically Admin)
Request:
  {
    "name": "string",
    "email": "string (valid email)",
    "password": "string",
    "departmentId": "number (required)",
    "gender": "MALE | FEMALE | OTHER",
    "designation": "PROFESSOR | ASSOCIATE_PROFESSOR | ..."
  }
Response:
  {
    "id": "number",
    "name": "string",
    "role": "FACULTY"
  }
Errors:
  - 500: Invalid departmentId, duplicate email
Frontend usage: Admin → Faculty Management → Register Faculty
```

### Register Student
```
Feature: Create Student User
Endpoint: /admin/register-student
Method: POST
Authentication: PUBLIC (permitAll)
Role: Public endpoint (logically Admin)
Request:
  {
    "name": "string",
    "email": "string (valid)",
    "password": "string",
    "departmentId": "number (required)",
    "courseId": "number (required)",
    "branchId": "number (required)"
  }
Response:
  {
    "id": "number",
    "name": "string",
    "role": "STUDENTS"
  }
Errors:
  - 500: Invalid dept/course/branch ID; duplicate email
Frontend usage: Admin → Student Management → Register Student
```

### Update Student (Admin)
```
Feature: Admin updates any student
Endpoint: /admin/student-update
Method: PUT
Authentication: JWT Bearer
Role: ADMIN
Request: StudentDTO (see DTO section)
Response: Student entity object
Errors: 401 Unauthorized, 403 Forbidden, 500 (student not found)
Frontend usage: Admin → Student edit form
```

### Get All Students
```
Feature: List all student names
Endpoint: /admin/get-all-students
Method: GET
Authentication: JWT Bearer
Role: ADMIN
Request: (none)
Response: ["string firstName", "string firstName", ...]
Errors: 401, 403
Frontend usage: Admin dashboard → Students count / list (⚠️ returns only first names, not full objects)
```

### Delete Student
```
Feature: Delete student by email
Endpoint: /admin/student-delete
Method: DELETE
Authentication: JWT Bearer
Role: ADMIN
Request:
  {
    "email": "student@college.edu"
  }
Response: "string (deleted student's first name)"
Errors: 401, 403, 500 (not found)
Frontend usage: Admin → Student list → Delete action
```

### Admin Change Password
```
Feature: Change any user's password
Endpoint: /admin/change-password
Method: PUT
Authentication: JWT Bearer
Role: ADMIN
Request:
  {
    "email": "user@college.edu",
    "password": "newPassword"
  }
Response: "Name : your password is updated"
Errors: 401, 403, 500
Frontend usage: Admin → User management → Reset password
```

### Create/Update Department
```
Feature: Create new department (auto-generates code)
Endpoint: /admin/update_department
Method: POST
Authentication: PUBLIC (permitAll)
Role: Public (logically Admin)
Request:
  {
    "name": "Computer Science",
    "code": "CSE" (optional? backend ignores it and auto-generates)
  }
Response: "new department is setuped"
Errors: 500
Frontend usage: Admin → Department Management → Add Department
```

### Insert Course
```
Feature: Add course under a department
Endpoint: /admin/insert-course
Method: POST
Authentication: PUBLIC (permitAll)
Role: Public (logically Admin)
Request:
  {
    "name": "B.Tech",
    "duration": 4,
    "department_id": 1
  }
Response: "Course inserted successfully"
Errors: 500 (dept not found)
Frontend usage: Admin → Course Management → Add Course
```

---

## Student APIs

### Student View Profile
```
Feature: View logged-in student profile
Endpoint: /students/view-profile
Method: GET
Authentication: JWT Bearer
Role: ADMIN, STUDENTS
Request: (none, email from Authentication object)
Response:
  {
    "name": "Student Name",
    "email": "student@college.edu"
  }
  ⚠️ Only returns name + email (CreateUserDto), NOT full student entity/role
Errors: 401, 403, 500
Frontend usage: Role detection probe (200 = STUDENT or ADMIN), Student profile page
```

### Update Own Student Profile
```
Feature: Student self-update
Endpoint: /students/update
Method: PUT
Authentication: JWT Bearer
Role: ADMIN, STUDENTS
Request: StudentDTO
Response: Updated Student entity
Errors: 401, 403, 500
Frontend usage: Student → Profile Edit Form
```

### Student Change Password
```
Feature: Student changes own password
Endpoint: /students/student-change-password
Method: PUT
Authentication: JWT Bearer
Role: ADMIN, STUDENTS
Request:
  {
    "email": "student@college.edu",
    "password": "newPassword"
  }
Response: "Name : your password is updated"
Errors: 401, 403, 500
Frontend usage: Student → Change Password form
```

---

## Faculty APIs

### Update Faculty Profile
```
Feature: Faculty self-update (phone, lastName, address, specialization)
Endpoint: /faculty/faculty-update
Method: PUT
Authentication: JWT Bearer
Role: ADMIN, FACULTY
Request: FacultyRequestDTO
Response: Updated Faculty entity
Errors: 401, 403, 500
Frontend usage: Faculty → Profile Edit Form
```

### Faculty Change Password
```
Feature: Faculty changes own password
Endpoint: /faculty/faculty-change-password
Method: PUT
Authentication: JWT Bearer
Role: ADMIN, FACULTY
Request:
  {
    "email": "faculty@college.edu",
    "password": "newPassword"
  }
Response: "Name : your password is updated"
Errors: 401, 403, 500
Frontend usage: Faculty → Change Password form
```

---

# 6. DATA MODEL

## Entity Relationship Hierarchy
```
Department
  └── Course (belongs to Department via department_id)
        └── Branch (belongs to Course via course_id)
              └── Batch (belongs to Dept + Course + Branch)
                    └── Section (belongs to Batch; capacity: 60)
                          └── Student (assigned to Section + Batch + Dept + Course + Branch)

User (authentication base)
  ├── 1:1 → Student (if role=STUDENTS)
  └── 1:1 → Faculty (if role=FACULTY)
  (plus direct links: User → Department, Course, Batch, Section)

Faculty → belongs to Department (via department_id)
```

## Entity Details

### User (Auth Entity)
| Field | Type | Notes |
|---|---|---|
| id | Long (PK) | Auto-generated |
| name | String | User's full name |
| email | String (unique, not null) | Username for login |
| password | String | BCrypt encoded |
| role | Role Enum | ADMIN / FACULTY / STUDENTS |
| createdAt | LocalDateTime | Auto-set on creation |
| department_id | FK → Department | Optional |
| course_id | FK → Course | Optional |
| batch_id | FK → Batch | Optional |
| section_id | FK → Section | Optional |

### Student
| Field | Type | Notes |
|---|---|---|
| id | Long (PK) | Auto-generated |
| rollNo | String (unique) | Format: `NIU-<userId>` |
| email | String (unique) | Same as user.email |
| firstName | String | |
| lastName | String | |
| semester | Integer | Default 1 on create |
| phone | String | Auto-generated on register |
| address | String | Default "Not Provided" |
| user_id | FK → User (1:1) | Required |
| department_id | FK → Department | |
| course_id | FK → Course | |
| branch_id | FK → Branch | |
| batch_id | FK → Batch | |
| section_id | FK → Section | |

### Faculty
| Field | Type | Notes |
|---|---|---|
| id | Long (PK) | Auto-generated |
| employeeId | String (unique) | Format: `NIU-EMP-<userId>` |
| firstName, lastName | String | |
| email, phone | String (unique) | |
| address | String | TEXT |
| gender | Gender Enum | |
| dateOfBirth | String | |
| department_id | FK → Department | Required |
| designation | Designation Enum | Required |
| specialization, highestQualification | String | |
| joiningDate | LocalDate | Required |
| active | Boolean | Default true |
| profilePhoto | String | URL/path |
| user_id | FK → User (1:1) | Required |
| createdAt, updatedAt | LocalDateTime | Auto |

### Department
| Field | Type |
|---|---|
| id | Long (PK) |
| name | String (e.g., "Computer Science") |
| code | String (e.g., "CSE-XXXX" — auto-generated) |

### Course
| Field | Type |
|---|---|
| id | Long (PK) |
| name | String (e.g., "B.Tech") |
| duration | Integer (years) |
| department_id | FK → Department (required) |

### Branch
| Field | Type |
|---|---|
| id | Long (PK) |
| name | String (e.g., "Computer Science & Engineering") |
| course_id | FK → Course (required) |

### Batch
| Field | Type |
|---|---|
| id | Long (PK) |
| admissionYear | String |
| batchName | String (required) |
| department_id, course_id, branch_id | FKs |
| sections | List<Section> |

### Section
| Field | Type |
|---|---|
| id | Long (PK) |
| sectionName | String |
| batch_id | FK → Batch |
| capacity | int (default 60) |
| currentCount | int |
| UniqueConstraint | (batch_id, section_name) |

---

# 7. FRONTEND ARCHITECTURE

## Directory Structure
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Sidebar, Navbar, DashboardCard, LoadingSpinner, ErrorMessage
│   │   └── forms/          # LoginForm, etc.
│   ├── pages/              # Route-level page components
│   │   ├── LoginPage.jsx
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx
│   │   ├── student/
│   │   │   └── StudentDashboard.jsx
│   │   └── faculty/
│   │       └── FacultyDashboard.jsx
│   ├── layouts/            # Layout wrappers
│   │   ├── AdminLayout.jsx
│   │   ├── StudentLayout.jsx
│   │   └── FacultyLayout.jsx
│   ├── routes/             # Routing + guards
│   │   ├── AppRoutes.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleGuard.jsx
│   ├── services/           # API service layer
│   │   ├── api.js          # Base fetch wrapper + interceptors
│   │   ├── authService.js  # Login, logout, role detection
│   │   ├── adminService.js
│   │   ├── studentService.js
│   │   └── facultyService.js
│   ├── context/            # React Context for auth state
│   │   └── AuthContext.jsx
│   ├── hooks/              # Custom hooks
│   │   └── useAuth.js
│   ├── utils/              # Helpers
│   │   ├── jwt.js          # JWT decode helper
│   │   └── constants.js    # Role constants, routes
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css           # Tailwind directives + custom styles
├── public/
├── ERP_FRONTEND_PLAN.md    # THIS FILE
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

# 8. ROUTE ARCHITECTURE

| Route | Role | Page/Component | Purpose | Backend API Used | Auth Required |
|---|---|---|---|---|---|
| `/login` | Public | `LoginPage` | Common login for all roles | `POST /auth/login` | No |
| `/` | Redirect | — | Redirects to login or role dashboard | — | — |
| `/admin/dashboard` | ADMIN | `AdminDashboard` inside `AdminLayout` | Admin landing page | `GET /admin/get-all-students` | Yes |
| `/admin/students` | ADMIN | (Pending) | Student management | Multiple admin APIs | Yes |
| `/admin/faculty` | ADMIN | (Pending) | Faculty management | Multiple admin APIs | Yes |
| `/admin/departments` | ADMIN | (Pending) | Dept/course management | Admin dept/course APIs | Yes |
| `/student/dashboard` | STUDENT | `StudentDashboard` inside `StudentLayout` | Student landing page | `GET /students/view-profile` | Yes |
| `/student/profile` | STUDENT | (Pending) | Student profile view/edit | Student view/update APIs | Yes |
| `/faculty/dashboard` | FACULTY | `FacultyDashboard` inside `FacultyLayout` | Faculty landing page | (No faculty GET API yet) | Yes |
| `/faculty/profile` | FACULTY | (Pending) | Faculty profile edit | Faculty update API | Yes |

---

# 9. DASHBOARD SPECIFICATIONS

## ADMIN Dashboard

### Sidebar / Navigation
- Dashboard (Home)
- Students (Register, View All, Edit, Delete)
- Faculty (Register, View All - commented endpoint)
- Departments & Courses (Create, List)
- Password Reset (For any user)
- Logout

### Dashboard Cards
1. **Total Students** — Count (from `/admin/get-all-students` array length)
2. **Total Faculty** — Placeholder count (get-all-faculty endpoint is commented out)
3. **Departments** — Placeholder (no list endpoint)
4. **Active Courses** — Placeholder (no list endpoint)

### Sections
- **Quick Actions** grid: Register Student, Register Faculty, Add Department, Add Course
- **Recent Students** list (from `get-all-students` — first names only)
- **Management Shortcuts**: Reset Password, Student Update, Delete Student

### APIs Used
- `GET /admin/get-all-students` — for count + names list

---

## STUDENT Dashboard

### Sidebar / Navigation
- Dashboard (Home)
- My Profile (View, Edit)
- Academic Info (Course, Branch, Semester, Section — when backend endpoints available)
- Change Password
- Logout

### Dashboard Cards
1. **Personal Info** — Name, Email (from `/students/view-profile`)
2. **Current Semester** — Placeholder (no endpoint to fetch student entity)
3. **Course / Branch** — Placeholder (no endpoint)
4. **Section / Batch** — Placeholder (no endpoint)

### Sections
- **Welcome Banner** — "Welcome, {Student Name}"
- **Academic Summary** (card UI only, until more endpoints exist)
- **Quick Actions**: View Profile, Edit Profile, Change Password

### APIs Used
- `GET /students/view-profile` — name + email only

---

## FACULTY Dashboard

### Sidebar / Navigation
- Dashboard (Home)
- My Profile (Edit details)
- Teaching Assignments (Placeholder — no backend endpoint)
- Change Password
- Logout

### Dashboard Cards
1. **Faculty Info** — Name, Employee ID (placeholder, no GET endpoint)
2. **Designation** — Placeholder
3. **Department** — Placeholder
4. **Specialization** — Placeholder

### Sections
- **Welcome Banner** — "Welcome, Prof. {Faculty Name}"
- **Academic Profile** summary cards
- **Quick Actions**: Update Profile, Change Password

### APIs Used
- ⚠️ **No faculty GET profile endpoint exists** in FacultyController. Only PUT update exists. Faculty name must be carried from JWT email + manual localStorage on first login, or name must be obtained elsewhere. For now, show email from decoded JWT.

---

# 10. PAGE-BY-PAGE SPECIFICATION

## Page: LoginPage
```
Route: /login
Role: Public
Purpose: Single login form for ADMIN, STUDENT, FACULTY roles

UI:
  - ERP branding header (College name + logo placeholder)
  - Card layout centered on page
  - Form title: "Sign in to ERP Portal"
  - Email input (type=email, required, placeholder="Email ID")
  - Password input (type=password, required, placeholder="Password")
  - "Sign In" button (primary, full-width)
  - Loading spinner inside button when submitting
  - Error alert banner below form on auth failure
  - Footer: "© 2026 College ERP Portal"

Data required:
  - email, password from form input
  - On success: { id, jwt } from login API

API:
  - POST /auth/login (email, password)
  - POST-login role detection (see Section 3)

User actions:
  - Submit form → validate → call API → store token → detect role → redirect dashboard
  - Show inline validation errors (empty fields, invalid email)

Loading state:
  - Button disabled + spinner text: "Signing in..."
  - Inputs disabled during request

Empty state: N/A

Error state:
  - Red alert banner: "Invalid email or password. Please try again." (401)
  - Generic error: "Something went wrong. Please try later." (5xx)

Navigation:
  - On success (role detected) → redirect to /{role}/dashboard
  - Already logged in → auto redirect from /login to appropriate dashboard
```

---

## Page: AdminDashboard
```
Route: /admin/dashboard
Role: ADMIN
Purpose: Admin landing page with overview + nav

UI:
  - AdminLayout: Left sidebar + Top navbar
  - Navbar: College logo, "Admin Portal" title, User email dropdown, Logout
  - Sidebar: Navigation menu (Dashboard, Students, Faculty, Departments, etc.)
  - 4 Stat cards: Total Students, Total Faculty, Departments, Courses
  - Quick Actions grid (4 cards): Register Student, Register Faculty, Add Dept, Add Course
  - Recent Students list card

Data required:
  - Student list (first names only) from getAllStudents API

API:
  - GET /admin/get-all-students

User actions:
  - Click sidebar → navigate to section (not implemented yet)
  - Logout → clear auth → /login
  - Quick action cards → (pending implementation, just UI)

Loading state:
  - Skeleton cards while data fetching
  - Loading spinner overlay optional

Empty state:
  - "No students registered yet" if list empty

Error state:
  - Error card: "Failed to load dashboard data" with retry

Navigation:
  - Sidebar links to (pending) pages
  - Logout button → /login
```

---

## Page: StudentDashboard
```
Route: /student/dashboard
Role: STUDENT
Purpose: Student landing page with academic overview

UI:
  - StudentLayout: Left sidebar + Top navbar
  - Navbar: "Student Portal", user email, logout
  - Sidebar: Dashboard, My Profile, Academic Info, Change Password
  - Welcome banner card: "Welcome back, {name}!"
  - 4 Info cards: Personal Info, Current Semester, Course/Branch, Section/Batch
  - Quick Actions: View Profile, Edit Profile, Change Password

Data required:
  - name, email from view-profile API

API:
  - GET /students/view-profile

User actions:
  - Nav sidebar, Logout, Quick action buttons

Loading state: Skeleton cards / spinner

Empty state: N/A (always at least name + email)

Error state: Error banner on API failure

Navigation: Links to pending pages
```

---

## Page: FacultyDashboard
```
Route: /faculty/dashboard
Role: FACULTY
Purpose: Faculty landing page with teaching overview

UI:
  - FacultyLayout: Left sidebar + Top navbar
  - Navbar: "Faculty Portal", user email, logout
  - Sidebar: Dashboard, My Profile, Teaching, Change Password
  - Welcome banner: "Welcome, Prof. {name}!"
  - 4 Info cards: Faculty Info, Designation, Department, Specialization
  - Quick Actions: Update Profile, Change Password

Data required:
  - Email from JWT decode
  - ⚠️ Rest is placeholder — no GET endpoint for faculty profile

API:
  - None (future: faculty profile GET endpoint needed from backend)

User actions:
  - Nav, Logout, Quick actions (UI only)

Loading state: Brief spinner on mount

Empty state: N/A

Error state: N/A

Navigation: Links to pending pages
```

---

# 11. COMPONENT ARCHITECTURE

## `components/common/` — Reusable UI

| Component | Props / Purpose | Reuse Locations |
|---|---|---|
| `Sidebar` | items: array of {icon, label, path}, role variant | Admin, Student, Faculty layouts |
| `Navbar` | title, userEmail, onLogout | All 3 layouts |
| `DashboardCard` | title, value, icon, color, description | All dashboards, stat cards |
| `QuickActionCard` | title, icon, onClick, desc | Admin + Student + Faculty dashboards |
| `LoadingSpinner` | size: sm/md/lg, fullScreen: bool | Login button, dashboards, guards |
| `ErrorMessage` | message, onRetry? | All pages, forms |
| `ProtectedRoute` | children | Route-level wrapper |
| `RoleGuard` | allowedRoles: [], children | Inside ProtectedRoute |

---

# 12. API SERVICE ARCHITECTURE

## Directory
```
services/
├── api.js              # Base fetch wrapper (headers, error handling)
├── authService.js      # login, logout, detectRole, getCurrentUser
├── adminService.js     # admin-specific endpoints
├── studentService.js   # student-specific endpoints
└── facultyService.js   # faculty-specific endpoints
```

## Base URL
```js
const BASE_URL = "http://localhost:8080";  // Spring Boot default
```
Configured in `services/api.js` (single source of truth).

## Fetch Strategy
- Native `fetch()` API — no axios dependency (keeps bundle small)
- Every request:
  - Auto-attach `Content-Type: application/json`
  - Auto-attach `Authorization: Bearer <token>` from localStorage
- Response interceptor-like wrapper:
  - 401/403 → clear localStorage → redirect `/login`
  - Non-ok status → throw Error with message
  - Parse JSON response (or text for string responses)

## Token Handling
- Getter: `services/api.js → getToken() → localStorage.getItem("erp_token")`
- Attach: `Authorization: Bearer ${token}` header
- Clear on 401/403: `localStorage.removeItem("erp_token")` + redirect

## Error Handling
```js
// api.request() wrapper pattern
try {
  const res = await fetch(url, opts);
  if (res.status === 401 || res.status === 403) {
    authService.logout();  // clears + redirects
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const contentType = res.headers.get("content-type");
  return contentType?.includes("application/json") ? res.json() : res.text();
} catch (err) { throw err; }
```

---

# 13. UI/UX DESIGN SYSTEM

## Color Approach (Tailwind)
- **Primary**: Deep indigo-blue (college/ERP feel)
  - Primary-500: `indigo-600` (buttons, links)
  - Primary-700: `indigo-700` (hover)
  - Primary-50: `indigo-50` (light bg)
- **Secondary**: Slate grays for neutral UI
- **Success**: `emerald-600`
- **Error**: `rose-600`
- **Warning**: `amber-500`
- **Role colors**:
  - Admin accent: Purple (`purple-600`)
  - Student accent: Blue (`blue-600`)
  - Faculty accent: Teal (`teal-600`)

## Typography (Tailwind defaults + custom)
- Sans: system-ui, -apple-system, sans-serif
- Headings: font-bold, tracking-tight
  - H1: `text-2xl md:text-3xl font-bold`
  - H2: `text-xl md:text-2xl font-semibold`
  - H3: `text-lg font-semibold`
- Body: `text-sm md:text-base text-slate-600`
- Monospace (IDs, codes): `font-mono text-xs`

## Spacing
- Follow Tailwind default scale
- Card padding: `p-5 md:p-6`
- Section gap: `gap-4 md:gap-6`
- Container max width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

## Cards
- Base: `bg-white rounded-xl shadow-sm border border-slate-200`
- Hover (if actionable): `hover:shadow-md transition-shadow`
- Stat card accent: `border-l-4 border-{color}-500`

## Buttons
- Primary: `bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`
- Secondary: `bg-white border border-slate-300 text-slate-700 rounded-lg px-4 py-2 hover:bg-slate-50`
- Danger: `bg-rose-600 text-white hover:bg-rose-700`
- Full-width: `w-full justify-center inline-flex items-center gap-2`

## Forms
- Input: `w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition`
- Label: `block text-sm font-medium text-slate-700 mb-1`
- Form wrapper: `space-y-4`
- Validation error: `text-rose-600 text-xs mt-1`

## Tables (Future)
- Wrapper: `overflow-hidden rounded-xl border border-slate-200`
- Header: `bg-slate-50 text-slate-600 text-xs uppercase tracking-wider`
- Rows: `hover:bg-slate-50 transition`

## Sidebar
- Desktop: Fixed left, w-64, h-screen, bg-slate-900 text-slate-100
- Mobile: Slide-in drawer, toggle from Navbar
- Active item: `bg-indigo-600 text-white rounded-lg`
- Inactive hover: `bg-slate-800 rounded-lg`

## Navbar
- Height: h-16, sticky top-0, z-30
- Background: `bg-white/80 backdrop-blur border-b border-slate-200`
- Content: Logo + Title (left), User avatar + email dropdown + logout (right)

## Responsive Behavior
- **Mobile (< 768px)**: Sidebar hidden → hamburger menu opens drawer; stat cards 1 column; full-width actions
- **Tablet (768-1023px)**: 2-column stat grids; sidebar collapsed or icon-only option
- **Desktop (≥ 1024px)**: Sidebar always visible; 4-column stat grids

## Dashboard Layout (per role)
```
┌────────────────────────────────────────────────────┐
│ Navbar (sticky, full width)                        │
├────────┬───────────────────────────────────────────┤
│        │  Page title + breadcrumb                  │
│ Sidebar│  ───────────────────────────────────────  │
│ (fixed,│  Stat cards grid (2x2 on md, 4 on lg)     │
│  w-64) │  ───────────────────────────────────────  │
│        │  Quick Actions grid                       │
│        │  ───────────────────────────────────────  │
│        │  Content area / tables / forms            │
└────────┴───────────────────────────────────────────┘
```

---

# 14. STATE MANAGEMENT

## Strategy: React Context + localStorage (NO Redux)
Project complexity is currently low (3 roles, single-user auth, no complex multi-component state sync). Redux is unnecessary overhead.

## Auth Context (`AuthContext.jsx`)
Global state available to entire app:
```js
{
  isAuthenticated: boolean,   // derived from token existence
  user: {                     // current user info
    id: number | null,
    email: string | null,
    role: "ADMIN" | "STUDENT" | "FACULTY" | null,
    name: string | null       // from JWT decode or profile API
  },
  loading: boolean,           // initial auth check / role detection loading
  login: (email, password) => Promise<void>,
  logout: () => void,
  refreshUser: () => Promise<void>
}
```

## State Map
| State | Source | Persistence |
|---|---|---|
| JWT Token | POST /auth/login | localStorage `erp_token` |
| User ID | POST /auth/login | localStorage `erp_userId` |
| Role | Probe endpoints after login | localStorage `erp_role` |
| Email | JWT `sub` claim (decoded) | localStorage `erp_email` |
| Name | view-profile API or JWT fallback | localStorage `erp_name` |

## Loading/Error States
- Per-component local state (useState) for:
  - Form submitting state
  - Page data loading
  - API-specific error messages

---

# 15. SECURITY RULES

## Protected Routes
- Every `/admin/*`, `/student/*`, `/faculty/*` route wrapped in `ProtectedRoute`
- `ProtectedRoute` checks:
  1. Token exists in localStorage → if not → redirect `/login`
  2. (Optional) Quick API probe to validate token is not expired
- `RoleGuard` inside: `allowedRoles.includes(user.role)` → otherwise redirect to correct dashboard

## Role-Based Route Protection
```
/admin/*      → RoleGuard allowedRoles=["ADMIN"]
/student/*    → RoleGuard allowedRoles=["STUDENT"]  (note: backend enum = STUDENTS, frontend normalizes to STUDENT)
/faculty/*    → RoleGuard allowedRoles=["FACULTY"]
```
⚠️ Frontend role checks are UI-only. Backend is the real security boundary.

## Token Handling
- DO NOT store tokens in plain code / public repo
- localStorage is acceptable for single-origin SPA
- Never log tokens to console in production
- On browser "Clear Site Data" → user must re-login

## Logout
- Clear ALL auth-related localStorage keys
- Redirect `/login` immediately
- Replace history to prevent back-button

## Unauthorized Responses
- Global interceptor in api.js: on 401/403 → auto logout + redirect
- Show toast / flash message: "Session expired. Please sign in again."

## Preventing Unauthorized UI Access
- Even if user manually injects role in localStorage, backend APIs will reject
- Sidebar conditionally renders only role-appropriate items
- Dashboard routes have both ProtectedRoute + RoleGuard

---

# 16. IMPLEMENTATION STATUS

## Completed (Day 1)
- [x] Backend analysis complete
- [x] API documentation complete
- [x] Entity/data model documented
- [x] ERP_FRONTEND_PLAN.md created (this file)
- [x] React + Vite setup
- [x] Tailwind CSS setup
- [x] Project folder structure created
- [x] Services layer (api, authService, adminService, studentService, facultyService)
- [x] AuthContext + useAuth hook
- [x] Routes: AppRouter, ProtectedRoute, RoleGuard
- [x] Common components: Sidebar, Navbar, DashboardCard, LoadingSpinner, ErrorMessage, QuickActionCard
- [x] Login page (common for all roles)
- [x] Actual backend login API integration
- [x] Role detection logic (post-login endpoint probing)
- [x] Admin layout + Admin dashboard landing page
- [x] Student layout + Student dashboard landing page
- [x] Faculty layout + Faculty dashboard landing page
- [x] Responsive layouts (mobile sidebar drawer, desktop sidebar)
- [x] Loading and error states on login

## In Progress
- [ ] None (Day 1 scope complete)

## Pending
- [ ] Admin: Student Management page (Register, List, Edit, Delete)
- [ ] Admin: Faculty Management page (Register, List — needs backend endpoint)
- [ ] Admin: Departments & Courses page (Create, List — needs list endpoints)
- [ ] Admin: Password Reset form for any user
- [ ] Student: Profile page (View/Edit full student entity — needs GET endpoint)
- [ ] Student: Academic Info page (needs backend course/batch/section GET)
- [ ] Student: Change password form
- [ ] Faculty: Profile edit page
- [ ] Faculty: Change password form
- [ ] Backend: Role-in-login-response enhancement (documented as limitation)
- [ ] Backend: Faculty GET profile endpoint
- [ ] Backend: Student GET full profile endpoint (current view-profile returns only name+email)
- [ ] Backend: Faculty list endpoint (currently commented)
- [ ] Backend: Department/Course/Branch list endpoints (needed for dropdowns)
- [ ] CORS configuration in backend (or proxy in Vite)
- [ ] Session expiry refresh logic
- [ ] Toast / snackbar notification system

## Blocked
- [ ] Faculty dashboard stats: Blocked — no faculty GET profile API exists
- [ ] Student full profile display: Blocked — current view-profile returns only name+email
- [ ] Department/Course dropdowns in forms: Blocked — no GET list endpoints in backend
- [ ] Faculty list / management: Blocked — get-all-faculty endpoint is commented out

---

# 17. CHANGE LOG

## Day 1 (2026-08-26)
- Inspected complete Spring Boot backend (Ai-Powered-ERP): controllers, services, entities, repos, DTOs, security config
- Documented authentication flow, JWT mechanism, role-based authorization rules
- Identified all 4 controllers, ~14 API endpoints, 8 entities, 3 enums
- Created `frontend/` directory, separated from backend
- Created master `ERP_FRONTEND_PLAN.md` (this file) with all 19 sections
- Scaffolded React 18 + Vite project in frontend/
- Integrated Tailwind CSS with custom config (ERP theme)
- Set up folder structure: components/, pages/, layouts/, routes/, services/, context/, hooks/, utils/
- Created API service layer with base fetch wrapper (token attach, 401/403 handler)
- Created authService: login, logout, role detection (probe strategy), JWT decode
- Implemented AuthContext + useAuth hook for global auth state
- Created AppRoutes with React Router 6 + ProtectedRoute + RoleGuard
- Built common components: Sidebar (mobile/desktop), Navbar, DashboardCard, QuickActionCard, LoadingSpinner, ErrorMessage
- Designed and built common LoginPage (email/password, validation, loading, error states)
- Built AdminLayout + AdminDashboard (4 stat cards, quick actions, recent students)
- Built StudentLayout + StudentDashboard (welcome banner, info cards, quick actions)
- Built FacultyLayout + FacultyDashboard (welcome banner, info cards, quick actions)
- Tested frontend build: vite build succeeds
- Verified backend NOT modified (0 changes to Ai-Powered-ERP folder)

---

# 18. KNOWN LIMITATIONS / DECISIONS

## Backend Gaps (Cannot modify backend — documented here)

### 1. ⚠️ Login Response Missing Role (CRITICAL)
**Problem**: `POST /auth/login` returns only `{ id, jwt }`. JWT payload contains only `sub` (email), `iat`, `exp`. **No role information is returned anywhere at login time.**
**Impact**: Frontend cannot route user to correct dashboard immediately after login.
**Workaround (Implemented)**: After login success, frontend sequentially probes role-specific endpoints:
  1. Try `GET /admin/get-all-students` → if 200 → role=ADMIN
  2. Try `GET /students/view-profile` → if 200 → role=STUDENT
  3. Else → assume FACULTY
**Risk**: Extra 2-3 API calls on every login. No faculty GET endpoint exists, so faculty role is "inferred by elimination" — fragile.
**Backend Fix Needed**: Add `role` field to `LoginResponceDTO`, or add role claim to JWT.

### 2. ⚠️ No Faculty GET Profile Endpoint
**Problem**: `FacultyController` has only PUT endpoints. No `GET /faculty/view-profile` or similar exists.
**Impact**: Faculty dashboard cannot display name, designation, department stats. Only email (from JWT) is known.
**Workaround**: Display email from decoded JWT, show other fields as placeholders with "—".
**Backend Fix Needed**: Add `GET /faculty/view-profile` returning `FacultyRequestDTO` or faculty entity.

### 3. ⚠️ Student view-profile Returns Minimal Data
**Problem**: `GET /students/view-profile` returns `CreateUserDto` containing only `{ name, email }`. No semester, course, branch, batch, section, rollNo, phone, address.
**Impact**: Student dashboard info cards must show "—" for academic details.
**Workaround**: Show only name+email from API; rest as pending.
**Backend Fix Needed**: Return `StudentDTO` (with all student fields) instead of `CreateUserDto`.

### 4. ⚠️ get-all-students Returns Only First Names
**Problem**: `GET /admin/get-all-students` → `List<String>` (first names only). No IDs, emails, roll numbers.
**Impact**: Cannot create a student list/table with actions (edit, delete by email). Admin dashboard student count is limited.
**Workaround**: Use array length for count, display names as "Recent Students" preview.
**Backend Fix Needed**: Return `List<StudentDTO>` instead of `List<String>`.

### 5. ⚠️ get-all-faculty Endpoint Commented Out
**Problem**: In AdminController lines 78-81, get-all-faculty is commented.
**Impact**: Faculty count on admin dashboard is a placeholder "N/A".
**Backend Fix Needed**: Uncomment or implement GET endpoint.

### 6. ⚠️ No Department/Course/Branch List GET Endpoints
**Problem**: No GET endpoints to fetch departments, courses, branches as lists.
**Impact**: Cannot populate dropdowns in student/faculty registration forms (future).
**Backend Fix Needed**: Add GET /admin/departments, GET /admin/courses, GET /admin/branches endpoints.

### 7. ⚠️ Several Admin Endpoints Have permitAll (Security)
**Problem**: In websecurityconfig lines 44-49, these are `permitAll()` (NOT secured):
  - `/admin/register-admin`
  - `/admin/register-faculty`
  - `/admin/register-student`
  - `/admin/update_department`
  - `/admin/insert-course`
This means ANYONE (even unauthenticated) can register an admin account or create departments.
**Impact**: Major security vulnerability. Documented here, not fixing backend.
**Backend Fix Needed**: Remove these from permitAll; add proper `hasRole("ADMIN")` guard.

### 8. CORS Required
Backend (8080) and frontend (5173) run on different ports. CORS must be enabled in backend, or frontend Vite dev proxy configured. Today: will use Vite dev proxy (`/api` → `http://localhost:8080`) as default, avoiding CORS in dev. Production needs CORS filter.

### 9. Backend Password-Change Endpoint Takes Email+NewPassword (No Old Password)
No re-authentication / old-password verification required before changing password. Noted.

### 10. FacultyService updatefaculty Bug
Line 21 in FacultyService.java: `faculty.setPhone(faculty.getPhone())` — sets phone to itself instead of DTO value. Frontend will send phone but backend silently ignores it.

---

# 19. NEXT AGENT HANDOFF

## Before Doing Anything
1. **Read this entire file** end-to-end.
2. Inspect `frontend/src/` directory structure and current implementation.
3. **DO NOT MODIFY THE BACKEND.** The `Ai-Powered-ERP/` folder is READ-ONLY.
4. Check **Section 16 — Implementation Status** to see what is done / pending / blocked.
5. Continue from the first item in **Pending** list (or Blocked if backend has been updated since).
6. Follow the architecture, API contracts, and design system documented here.
7. **Update this file** after completing work — update Implementation Status, Change Log, and Known Limitations (if any new ones discovered).
8. Do not redo already completed work unless there is a bug.

## Current Task
Day 1 setup completed. Frontend scaffolded with login + 3 role dashboards.

## Last Completed Task
Day 1: React/Vite setup, Tailwind, login page (backend-integrated), role detection, routing, 3 role dashboard landing pages (UI only for stats pending API data).

## Next Recommended Task
### Priority 1 (Depends on backend changes — coordinate first):
- Ask backend team to add `role` field to `LoginResponceDTO` (eliminates probe workaround)
- Add `GET /faculty/view-profile` endpoint
- Expand `GET /students/view-profile` to return full `StudentDTO`

### Priority 2 (Can start without backend changes — forms):
- Build **Admin → Register Student** page (uses existing public endpoint)
- Build **Admin → Register Faculty** page (uses existing public endpoint)
- Build **Admin → Add Department** page
- Build **Admin → Add Course** page

### Priority 3 (Self-service):
- Student → Change Password form (PUT endpoint exists)
- Student → Edit Profile form (PUT endpoint exists)
- Faculty → Change Password form
- Faculty → Edit Profile form

## Important Context
- **Role note**: Backend enum uses `STUDENTS` (plural). Frontend normalizes to `STUDENT` in UI. The probe system already accounts for this.
- **APIs with permitAll**: register-admin, register-faculty, register-student, update_department, insert-course are all PUBLIC — use them without JWT headers.
- **JWT expiry**: 40 minutes. After 40 min, user is auto-logged out via api.js 401 handler.
- **Vite proxy**: If backend running on 8080 and frontend on 5173, use Vite's server.proxy option to proxy `/api` to `http://localhost:8080` avoiding CORS.
- **Backend FacultyService bug**: Faculty phone update on backend silently fails — ignore on frontend until backend fixes.
- **Do NOT add Redux or heavy state libraries** unless app grows to 10+ complex form pages with cross-component state.
