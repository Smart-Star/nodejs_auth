# Project Architecture & Folder Guide

This document explains the purpose of each directory in this backend application. This setup utilizes a **Layered Architecture (Repository-Service Pattern)**, which separates concerns to ensure the codebase remains maintainable, testable, and scalable as the project grows.

---

## 📁 Project Structure Overview

```text
capstone-project/
├── migrations/                # Database schema version control
├── src/                       # Application source code
│   ├── config/                # Environment and global configurations
│   ├── errors/                # Custom error classes
│   ├── lib/                   # Core third-party initializations (DB, Logger)
│   ├── middleware/            # Express global middlewares
│   ├── repositories/          # Data Access Layer (Direct DB interactions)
│   ├── routes/                # Transport Layer (HTTP request routing)
│   ├── services/              # Business Logic Layer (The application "brain")
│   ├── types/                 # Global TypeScript definitions
│   └── utils/                 # Shared helper functions
├── .env                       # Local environment variables
└── docker-compose.yml         # Containerized infrastructure config
```

---

## 🛠️ Detailed Folder Breakdown

### 1. `migrations/`

- **Purpose**: Tracks structural changes to your database over time (DDL history).
- **Why it exists**: Instead of manually editing tables, migrations ensure every developer and your production server run the exact same database schema.
- **Example**: `001_enable_pgcrypto.sql` installs necessary cryptographic extensions into PostgreSQL before tables are created.

### 2. `src/config/`

- **Purpose**: Manages app-wide configurations and safely parses environmental variables. config describes environment and settings
- **Why it exists**: Prevents `process.env` from scattering across the app. `env.ts` typically uses validation libraries (like Zod) to crash the app immediately on startup if a required variable is missing.

### 3. `src/errors/`

- **Purpose**: Houses custom error classes.
- **Why it exists**: Standardizes how errors look. Your `app-error.ts` defines operational errors (like a `400 Bad Request` or `409 Conflict`) so the frontend receives consistent, predictable error responses.

### 4. `src/lib/`

- **Purpose**: Houses long-lived clients and utility instances.
- **Why it exists**: lib implements reusable logic. Ensures libraries like your database driver (`db.ts`) or logger (`logger.ts`) are initialized exactly once and reused across the application safely.

### 5. `src/middleware/`

- **Purpose**: Functions that intercept incoming requests before they hit your routes, or process responses right before they go to the client.
- **Why it exists**: Promotes code reuse. `error-handler.ts` catches any rejected promises/errors globally so the server never crashes, while `not-found.ts` handles invalid URLs.

### 6. `src/routes/`

- **Purpose**: The "Receptionist" layer. Maps HTTP endpoints to specific controller functions.
- **Why it exists**: This layer only handles HTTP concerns (extracting parameters, status codes, headers). It should never touch raw database logic or run complex business equations.

### 7. `src/services/`

- **Purpose**: The "Brain" or Business Logic Layer.
- **Why it exists**: This is where core rules live. For example, your `auth.service.ts` dictates what happens when a user registers: it normalizes input, checks if a password is too short, hashes passwords with bcrypt, and coordinates data flow.

### 8. `src/repositories/`

- **Purpose**: The Data Access Layer.
- **Why it exists**: Isolates SQL queries and ORM calls. `user.repository.ts` handles the raw data fetching and inserting (`SELECT * FROM users...`). If you ever swap your database (e.g., PostgreSQL to MongoDB), you _only_ rewrite files in this folder; your routes and services stay completely untouched.

---

## 🔄 How a Request Flows Through This System

When a user submits a registration request, it flows linearly through your folders:

```text
[ Client Request ]
       │
       ▼
 1. src/routes/auth.routes.ts         --> Validates HTTP payload, forwards to service
       │
       ▼
 2. src/services/auth.service.ts       --> Checks business rules, hashes password
       │
       ▼
 3. src/repositories/user.repository.ts --> Runs SQL query to insert user into DB
       │
       ▼
 [ Database Table ]
```

---

## 💡 Alternative approach: Feature-Based (Vertical Slice)

If technical layering feels too deep for a smaller project, structures can be refactored by **feature** rather than technical type. This keeps all files belonging to a specific capability in the same room:

```text
src/
└── features/
    ├── auth/
    │   ├── auth.routes.ts
    │   ├── auth.service.ts
    │   ├── user.repository.ts
    │   └── user.types.ts
    └── support/
        ├── support.routes.ts
        ├── support.service.ts
        └── support.repository.ts
```
