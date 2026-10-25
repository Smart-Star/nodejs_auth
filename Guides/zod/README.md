# Zod Setup and Project Changes

This document describes how to set up Zod and where to make exact changes in the project.

## 1) Install Zod

Run:

```powershell
npm install zod
```

No separate type package is required for TypeScript; Zod includes its own typings.

## 2) Update `package.json`

Add no new dependencies other than `zod`.

Example change in `package.json`:

```json
"dependencies": {
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "pg": "^8.22.0",
  "pino": "^10.3.1",
  "zod": "^4.0.0"
}
```

## 3) Replace env validation in `src/config/env.ts`

Current code uses a manual helper and throws generic `Error`.

Replace the file content with:

```ts
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.string().default("development"),
  LOG_LEVEL: z.string().default("info"),
  DATABASE_URL: z.url("DATABASE_URL must be a valid URL"),
});

const parsed = envSchema.parse(process.env);

export const env = {
  port: Number(parsed.PORT ?? 3000),
  isProduction: parsed.NODE_ENV === "production",
  nodeEnv: parsed.NODE_ENV,
  logLevel: parsed.LOG_LEVEL,
  databaseUrl: parsed.DATABASE_URL,
} as const;
```

This removes manual env checks and centralizes runtime validation.

## 4) Add request validation as a reusable schema

Create a dedicated validation folder and keep the auth request contract as a standalone Zod schema.

Create:

```text
src/validation/auth.schema.ts
```

Suggested file content:

```ts
import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

Then replace the route-file request parsing with imports from that schema file.

Suggested route shape:

```ts
import { Router } from "express";
import { authSchema } from "../validation/auth.schema";
import { loginUser, registerUser } from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  const parsed = authSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const { email, password } = parsed.data;
    await registerUser(email, password);

    return res.status(201).json({
      success: true,
      message: "User Registration is successfull. Please login to continue",
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  const parsed = authSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: parsed.error.flatten(),
    });
  }

  try {
    const { email, password } = parsed.data;
    await loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
});
```

This keeps the request contract reusable and keeps the route file focused on HTTP wiring.

## 5) Remove the custom AppError class

Delete `src/errors/app-error.ts`.

Then change any service file imports from `AppError` to use plain `Error` or route-level responses.

Example replacement in `src/services/auth.service.ts`:

```ts
import {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
} from "../repositories/user.repository";
import { BCRYPT_SALT_NUMBER, PASSWORD_LENGTH } from "../utils/constants";
import bcrypt from "bcryptjs";

export const registerUser = async (
  email: string,
  password: string,
): Promise<void> => {
  const normalizeEmail = email.toLowerCase().trim();

  const existingUser = await findUserByEmail(normalizeEmail);

  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_NUMBER);
  await createUser(normalizeEmail, passwordHash);
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<void> => {
  const normalizeEmail = email.toLowerCase().trim();
  const user = await findUserByEmailWithPassword(normalizeEmail);

  if (!user?.password_hash) {
    throw new Error("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }
};
```

## 6) Update `src/middleware/error-handler.ts`

Replace the `AppError` branch with Zod-specific handling and default fallback.

Suggested file content:

```ts
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error.",
      errors: err.errors,
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};
```

If you want to preserve HTTP status semantics, handle known messages in route handlers and return the correct status there.

## 7) Where to make changes

Files to update for the Zod migration:

- `package.json`
- `src/config/env.ts`
- `src/routes/auth.routes.ts`
- `src/validation/auth.schema.ts` (new file)
- `src/middleware/error-handler.ts`
- `src/services/auth.service.ts`
- Remove `src/errors/app-error.ts`

These changes replace custom validation and custom error behavior with Zod and standard runtime errors.
