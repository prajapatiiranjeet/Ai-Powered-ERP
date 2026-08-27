# 🎓 AI-Powered ERP System (Noida International University)

[![Spring Boot](https://img.shields.io/badge/Spring--Boot-v4.1.0-brightgreen.svg?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-orange.svg?logo=java)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-3.x-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![Development Status](https://img.shields.io/badge/Status-Work_In_Progress_(WIP)-yellow.svg)](#-development-status)

An **AI-Powered Academic & Enterprise Resource Planning (ERP)** platform custom-built for modern educational institutions like **Noida International University (NIU)**. 

The project features a robust **Spring Boot 4.1.0 (Java 21)** backend with **PostgreSQL** persistence and **JWT authentication**, paired with a **React 18 + Vite + Tailwind CSS** frontend featuring **SHERPAL AI Assistant** with glassmorphism UI.

---

- Spring Boot application with main class `com.chaiorcode.mycode.MycodeApplication ( CHAI OR CODE WALE CHANNEL SE SPRING SECURITY SETUP KRAA THA ISLIYE USKO THODA DEDICATED KRR RHA HU KAHI SE COPY NHI KRAA) ` 
- Spring Boot version: `4.1.0`
- Java version: `21`
- PostgreSQL as the target database
- Spring Data JPA for persistence
- Spring Security with JWT authentication
- Controllers for authentication, admin actions, student actions, and faculty actions
- DTOs, Entities, Repositories, Services, and basic security setup
> ⚠️ **Work In Progress (Active Development)**  
> This project is currently under active development. Core authentication, role dashboards (Admin, Faculty, Student), administrative CRUD operations, SHERPAL AI assistant, RAG document upload, vector indexing, and role-based document chat are functional. Advanced ERP module logic is still being developed.

---

## 🌟 Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **JWT (JSON Web Token) Security**: Secure stateless token authentication.
- **Multi-Role Portals**: Dedicated interfaces for **ADMIN**, **FACULTY**, and **STUDENT**.
- **Interactive Glassmorphic Login**: Login portal with animated canvas grid.

### Authentication
- `POST /auth/login   ( LOGIN SE PEHLE ADMIN  BANA LENA ISLIYE SECURITY FILTER ME MAINE ADMIN CONTROLLER KO PERMIT ALL KRAA HUA HAI USKE BAAD LOGIN TRY KRNA TABHI JWT TOKEN MILEGA )`
  - Accepts email/password in `LoginDTO`
  - Returns a JWT token in `LoginResponceDTO`

### 🛡️ 2. Admin Command Center
- **Institution Overview**: Real-time stats for Total Students, Faculty Members, Departments, and Active Courses.
- **User Management**: Modals to register new Faculty members, Admin accounts, and Students.
- **Department & Course Scaffolding**: Dynamic department option lookups, branch selections, and course subject assignments.
- **Knowledge Base RAG Uploader**: Portal for administrators to upload university handbooks, policy PDFs, and examination calendars for AI indexing.
- **Admin-only uploads**: Select PDF, DOC, or DOCX files, review the selected files, and click the upload button to index them.

### 🎓 3. Student Academic Portal
- **Academic Snapshot**: Track attendance percentages, active course enrollments, grade point averages, and fee receipts.
- **Personalized Profile**: View student details, enrolled department/branch, and security settings.

### 👨‍🏫 4. Faculty Portal
- **Faculty Dashboard**: Overview of assigned courses, student rosters, and grade submission statuses.
- **Attendance & Grading**: Scaffolding for marking daily attendance and submitting internal assessment marks.

### 🤖 5. SHERPAL AI Assistant
- **Glassmorphism UI**: Floating glass chatbot widget with ambient glows, sound feedback, and typing indicators.
- **Lion branding**: SHERPAL uses the linked lion icon in its launcher and chat header.
- **Role-Tailored Quick Prompts**: Quick prompt buttons for Students (*Exam Schedule*, *Fee Status*), Faculty (*Grade Submission*, *Leave Application*), and Admins (*User Management*, *Audit Logs*).
- **Control Bar**: Sound toggle (Web Audio FX), conversation clearing, window minimization, and chat expand.

### 🧠 6. RAG Integration
- **Chat access**: Admin, Faculty, and Student users chat through their role-specific protected endpoint.
- **Document indexing**: Admin uploads are sent as multipart files to the Spring Boot upload endpoint and stored in PGVector.
- **Table-aware DOCX extraction**: DOCX tables are converted to row-wise text with column separators before chunking, preserving header/value relationships for retrieval.
- **Upload independence**: File extraction and indexing do not call the Ollama chat endpoint. Ollama is used for embeddings and SHERPAL answers.

| Use case | Endpoint | Permission |
| :--- | :--- | :--- |
| Upload document | `POST /admin/upload-documents` | ADMIN |
| Ask SHERPAL | `POST /admin/ask-to-sherpal` | ADMIN |
| Ask SHERPAL | `POST /faculty/ask-to-sherpal` | FACULTY |
| Ask SHERPAL | `POST /students/ask-to-sherpal` | STUDENT |

### 🧪 Test Data
- [ERP Data test files](https://www.dropbox.com/scl/fo/bdknfl8ppsod4oxo0yr0k/ABAh9HgxKbn_JoPBr7YKMto?rlkey=90sya82ekh35aioqezv590atq&st=ibn4xrha&dl=0) (Dropbox shared folder)
- Upload supported PDF, DOC, or DOCX files from this folder through the Admin dashboard, then ask SHERPAL questions about the indexed content.

---

## 📸 Screenshots

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

| Page / Feature | Screenshot Preview |
| :--- | :--- |
| **Login Portal (Glass UI)** | ![Login Page](db/Screenshot%202026-08-26%20184328.png) |
| **Admin Command Center** | ![Admin Overview](db/Screenshot%202026-08-26%20184344.png) |
| **Faculty Registration Modal** | ![Register Faculty Modal](db/Screenshot%202026-08-26%20184633.png) |
| **Student Registration Modal** | ![Register Student Modal](db/Screenshot%202026-08-26%20184656.png) |
| **SHERPAL AI Assistant** | ![SHERPAL AI](db/Screenshot%202026-08-27%20051423.png) |
| **RAG Knowledge Base Uploader** | ![Knowledge Base](db/Screenshot%202026-08-26%20193636.png) |

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 4.1.0
- **Language**: Java 21
- **Security**: Spring Security + JWT (`io.jsonwebtoken:jjwt`)
- **Persistence**: Spring Data JPA / Hibernate
- **Database**: PostgreSQL
- **Utilities**: Lombok, Spring Boot Starter Validation

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + Custom Glassmorphism Engine
- **Routing**: React Router DOM 6
- **State Management**: React Context API (`AuthContext`)
- **Audio Feedback**: Web Audio API (Synthesized UI Sound FX)

---

## 📂 Project Architecture

```
Ai-Powered-ERP/
├── src/                                  # Spring Boot Java Backend
│   └── main/
│       ├── java/com/chaiorcode/mycode/
│       │   ├── Controller/               # REST API Endpoints (Admin, Auth, Faculty, Student)
│       │   ├── DTO/                      # Data Transfer Objects
│       │   ├── Entity/                   # JPA Database Entities
│       │   ├── Repo/                     # Spring Data JPA Repositories
│       │   ├── Service/                  # Business Logic & Auth Services
│       │   └── security/                 # JWT Authentication Filter & Security Config
│       └── resources/
│           └── application.properties    # Database & Server Config
│
├── frontend/                             # React 18 + Vite Frontend
│   ├── src/
│   │   ├── assets/                       # Images & SVGs (NIU Logo)
│   │   ├── components/common/            # SHERPAL AI Chatbot, Navbar, Sidebar, Modals
│   │   ├── context/                      # AuthContext (JWT State Management)
│   │   ├── layouts/                      # AdminLayout, FacultyLayout, StudentLayout
│   │   ├── pages/                        # Admin, Faculty, Student Dashboards & Login Page
│   │   ├── routes/                       # Protected & Public App Routes
│   │   ├── services/                     # API Service Clients (auth, admin, student, faculty)
│   │   └── index.css                     # Tailwind CSS & Glassmorphism Utilities
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── pom.xml                               # Maven Build Configuration
├── .gitignore                            # Git Exclusion Rules
└── README.md                             # Project Documentation
```

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Java 21 JDK** or higher
- **Node.js** (v18.x or higher) & **npm**
- **PostgreSQL** (v14.x or higher)
- **Git**

---

### 2. Database Configuration
1. Open PostgreSQL (via `psql` or pgAdmin) and create a database:
   ```sql
   CREATE DATABASE postgres;
   ```
2. Update database credentials in `src/main/resources/application.properties` if needed:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/postgres
   spring.datasource.username=postgres
   spring.datasource.password=YOUR_POSTGRES_PASSWORD
   spring.jpa.hibernate.ddl-auto=update
   ```

### 3. RAG Setup (PGVector + Ollama + Spring AI)

RAG requires PostgreSQL with the **pgvector** extension and a local Ollama instance. The backend uses Spring AI `1.0.8`, PGVector for document embeddings, and Ollama for embeddings and SHERPAL responses.

#### PostgreSQL and PGVector

Install a PostgreSQL build that includes pgvector, or install the pgvector extension for your PostgreSQL version. Then enable it in the ERP database:

```sql
CREATE DATABASE postgres;
\c postgres
CREATE EXTENSION IF NOT EXISTS vector;
```

The application is configured to create/update the Spring AI vector-store schema automatically:

```properties
spring.ai.vectorstore.pgvector.initialize-schema=true
spring.ai.vectorstore.pgvector.index-type=hnsw
spring.ai.vectorstore.pgvector.distance-type=cosine_distance
spring.ai.vectorstore.pgvector.dimensions=768
```

The `dimensions=768` value must match the output size of the configured embedding model.

#### Ollama Models

Install and start [Ollama](https://ollama.com/download), then pull both models used by the backend:

```powershell
ollama serve
ollama pull nomic-embed-text
ollama pull phi4-mini
```

The default configuration is:

```properties
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.embedding.options.model=nomic-embed-text:latest
spring.ai.ollama.chat.options.model=phi4-mini:latest
spring.ai.ollama.chat.options.temperature=0
```

`nomic-embed-text` is used when documents are indexed and searched. `phi4-mini` is used to generate SHERPAL answers. The browser does not call Ollama directly; it calls the Spring Boot endpoints.

#### Spring AI Dependencies

These dependencies are already present in `pom.xml` and are resolved through the Spring AI BOM:

- `spring-ai-starter-model-ollama`
- `spring-ai-starter-vector-store-pgvector`
- `spring-ai-pdf-document-reader`
- `spring-ai-tika-document-reader`
- Spring AI BOM version `1.0.8`

#### RAG Run Order

1. Start PostgreSQL and confirm the `vector` extension is enabled.
2. Start Ollama and confirm both models are available with `ollama list`.
3. Start the Spring Boot backend on port `8080`.
4. Log in as an Admin and upload a PDF, DOC, or DOCX from the Admin dashboard.
5. Wait for the upload/indexing success message, then ask SHERPAL about the uploaded document from any role portal.

---

### 4. Running Backend (Spring Boot)
Open a terminal in the root `Ai-Powered-ERP` directory:

**On Windows:**
```powershell
./mvnw.cmd spring-boot:run  ( MUJHE PATA HAI TU YEHI AYEGA)
```

**On macOS / Linux:**
```bash
./mvnw spring-boot:run ( SIR WO 100 RUPEE KI MADAD HOJATI TO )
```
The backend server will start on `http://localhost:8080`.

---

### 5. Running Frontend (React + Vite)
Open a new terminal window in the root `Ai-Powered-ERP` directory:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend application will start on `http://localhost:5173`.

---

## 📡 Key REST API Endpoints

### 🗝️ Authentication
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Login with email & password, returns JWT | Public |

### 🛡️ Admin Management
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/admin/register-admin` | Register a new Administrator | ADMIN |
| `POST` | `/admin/register-faculty` | Register a new Faculty Member | ADMIN |
| `POST` | `/admin/register-student` | Register a new Student | ADMIN |
| `GET` | `/admin/get-all-students` | Fetch list of all registered students | ADMIN |
| `PUT` | `/admin/student-update` | Update student profile & enrollment details | ADMIN |
| `DELETE` | `/admin/student-delete` | Delete student record | ADMIN |
| `POST` | `/admin/insert-course` | Add new course to catalog | ADMIN |
| `POST` | `/admin/update_department` | Manage department mappings | ADMIN |
| `GET` | `/admin/departments/options` | Dynamic department lookup options | ADMIN |

### 🎓 Student Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/students/view-profile` | Get current student details | STUDENT |
| `PUT` | `/students/update` | Update personal profile | STUDENT |
| `PUT` | `/students/student-change-password` | Change account password | STUDENT |

### 👨‍🏫 Faculty Endpoints
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `PUT` | `/faculty/faculty-update` | Update faculty profile | FACULTY |
| `PUT` | `/faculty/faculty-change-password` | Change account password | FACULTY |

---

## 📤 How to Push Updates to GitHub

To commit and push all updated backend code, frontend files, and documentation to the GitHub repository:

```bash
# 1. Check status of changed files
git status

# 2. Stage all changes
git add .

# 3. Commit with a descriptive message
git commit -m "feat: Add React frontend, SHERPAL AI chatbot, minimal dashboards, and updated README"

# 4. Push to main branch
git push origin main
```

**Repository Remote URL**: `https://github.com/prajapatiiranjeet/Ai-Powered-ERP`

---

## 🔮 Future Roadmap

- [x] Spring AI RAG document upload, PGVector indexing, and role-based SHERPAL chat.
- [ ] Real-time WebSocket notifications for attendance alerts and exam schedules.
- [ ] Student Fee Payment Gateway Integration (Razorpay/Stripe).
- [ ] Automated Grade Card Generator & Export to PDF.

---

## 👨‍💻 Developer & Author

- **Developer**: Ranjeet Prajapati
- **GitHub Repository**: [prajapatiiranjeet/Ai-Powered-ERP](https://github.com/prajapatiiranjeet/Ai-Powered-ERP)
- **Institution**: Noida International University (NIU)

---
*Built with ❤️ for Noida International University.*
