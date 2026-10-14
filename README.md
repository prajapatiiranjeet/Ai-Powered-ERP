# AI-Powered ERP (Developer Guide)

Independent academic ERP with JWT role portals (Admin, Faculty, Student) and SHERPAL — a role-aware RAG assistant over uploaded documents.

This file is a developer-focused README that includes exact env vars, copy-paste examples (SQL + curl), pgvector & Ollama install steps, where to find Sherpal/embedding code, and warnings about embedding dimensions.

---

## TL;DR — Yes you can run locally

- Backend (Spring Boot, port 8080)
  - ./mvnw spring-boot:run
- Frontend (Vite, port 5173)
  - cd frontend
  - npm install
  - npm run dev
- PostgreSQL with `pgvector` extension and Ollama running locally (models pulled).

---

## Quick checklist (fresh machine)

1. Install JDK 21+, Node 18+, npm
2. Install PostgreSQL 14+ and pgvector extension (see below)
3. Install Ollama and pull models (see below)
4. Create database and extension:
   ```sql
   CREATE DATABASE erpdemo;
   \c erpdemo
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Set environment variables:
   - Linux/macOS:
     ```bash
     export DB_PASSWORD="your_postgres_password"
     export JWT_SECRET="a-long-local-development-secret"
     ```
   - Windows PowerShell:
     ```powershell
     $env:DB_PASSWORD="your_postgres_password"
     $env:JWT_SECRET="a-long-local-development-secret"
     ```
6. Edit src/main/resources/application.properties only if you need non-default ports/URLs (sample below).
7. Start Ollama, start backend, then frontend.

---

## What this file adds

- explicit pgvector install guidance,
- Ollama install + model pull commands,
- full sample application.properties excerpts and env var list,
- "first admin" SQL insert example (with how to generate BCrypt password),
- curl examples for login, upload, and SHERPAL ask-to-sherpal,
- pointer to Sherpal/Chunking/Retrieval code locations in the repo,
- important gotchas (embedding dimension, file size limits, how RAG flow works).

---

## Full sample application.properties (important keys)

Place non-secret values in `src/main/resources/application.properties`. Secrets should be provided via environment variables as shown above.

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/erpdemo
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD:}

# Ollama (local)
spring.ai.model.embedding=ollama
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.options.model=phi4-mini:3.8b
spring.ai.ollama.chat.options.temperature=0
spring.ai.ollama.embedding.options.model=qwen3-embedding:0.6b

# PGVector
spring.ai.vectorstore.pgvector.initialize-schema=true
spring.ai.vectorstore.pgvector.index-type=hnsw
spring.ai.vectorstore.pgvector.distance-type=cosine_distance
spring.ai.vectorstore.pgvector.dimensions=1024

# Multipart file limits
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB

# JPA
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=${JWT_SECRET:}
```

Important: spring.ai.vectorstore.pgvector.dimensions must match your embedding model dimension. The repo uses 1024 for qwen3-embedding:0.6b.

---

## pgvector installation (Linux / macOS, quick)

If you need to build/install the extension locally:

```bash
# Example (Linux / macOS) — adapt for your package manager/version
sudo apt-get install -y build-essential git postgresql-server-dev-14 make gcc

git clone --branch v0.8.6 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Then in psql:
CREATE EXTENSION IF NOT EXISTS vector;
```

On macOS you can also use Homebrew if available or use Docker images that include pgvector.

(See demodata/pgvector-master/README.md in this repo for more details.)

---

## Ollama (local model host)

Install Ollama from https://ollama.com/download, then:

```bash
# Start Ollama daemon
ollama serve

# Pull the models used by this project
ollama pull qwen3-embedding:0.6b
ollama pull phi4-mini:3.8b

ollama list
```

Confirm `spring.ai.ollama.base-url` matches Ollama's server URL (default: http://localhost:11434).

---

## First admin user (copy-paste SQL)

The README notes: "First admin must be inserted manually after Hibernate creates tables." Example:

1. Generate a BCrypt hash of your desired password.

   Option A — Node:
   ```js
   // run in node
   const bcrypt = require('bcryptjs');
   bcrypt.hash('AdminPass123!', 10).then(h => console.log(h));
   ```

   Option B — small Java main using Spring Security's BCryptPasswordEncoder:
   ```java
   import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
   public class Hash {
     public static void main(String[] a) {
       System.out.println(new BCryptPasswordEncoder().encode("AdminPass123!"));
     }
   }
   ```

   Replace the password string above as needed. The output will be a $2a$... bcrypt hash.

2. Insert user into `users` table (example — replace hashed password & email):

```sql
INSERT INTO users (name, email, password, role, created_at)
VALUES ('Site Admin', 'admin@example.com', '$2a$10$EXAMPLE_BCRYPT_HASH_HERE', 'ADMIN', now());
```

After inserting, call:
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123!"}'
```
You should receive a JSON response containing `jwt`. Use that token (Authorization: Bearer <jwt>) to call protected admin APIs.

---

## Common curl examples

1. Login (public)
```bash
curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123!"}'
# returns JSON { id, jwt, role, name, email }
```

2. Upload a document (admin only)
```bash
curl -v -X POST "http://localhost:8080/admin/upload-documents" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@/path/to/sample.pdf"
```

3. Ask SHERPAL (student endpoint example)
```bash
curl -s -X POST "http://localhost:8080/students/ask-to-sherpal" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: text/plain" \
  --data "What are my attendance percentages for this semester?"
```

4. Assign subject to faculty (admin)
```bash
curl -X POST http://localhost:8080/admin/assign-subject-to-faculty \
 -H "Authorization: Bearer <JWT_TOKEN>" \
 -H "Content-Type: application/json" \
 -d '{ "facultyId": 5, "subjectId": 10, "courseId": 2, "branchId": 1, "batchId": 3, "sectionId": 1 }'
```

---

## RAG internals & where to look in code (important pointers)
- Sherpal orchestration:
  - SherpalService: src/main/java/com/chaiorcode/mycode/Service/SherpalService.java
  - RetrievalService (search): search is called from SherpalService (look for RetrievalService implementation)
- Document ingestion & chunking:
  - AdminController handles file upload + calls ChunkingService + vectorStore: src/main/java/com/chaiorcode/mycode/Controller/AdminController.java
  - ChunkingService: src/main/java/com/chaiorcode/mycode/Service/ChunkingService.java
  - Uses Spring AI DocumentReader (PagePdfDocumentReader and TikaDocumentReader) and ChatClient to clean extracted text.
- Vector store integration:
  - Config is in src/main/resources/application.properties (spring.ai.vectorstore.pgvector.*)
  - The schema initialization is controlled by spring.ai.vectorstore.pgvector.initialize-schema=true
  - If you change embedding model/dimension: drop vector store table and reinitialize (DROP TABLE IF EXISTS vector_store;)
- Embedding model config:
  - spring.ai.ollama.embedding.options.model=qwen3-embedding:0.6b (default in repo)
  - dimension used in application.properties is 1024 to match that embedding.

---


- Create a small script to generate a BCrypt hash from the command line to simplify creating the first admin.
- Open a PR that adds README.dev.md and links to it from README.md.
