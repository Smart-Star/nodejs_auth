# Connect a Next.js + shadcn UI to this API

This guide covers the existing Express API in this repository and a separate
Next.js app. The API is the source of truth for authentication and data; the
browser should call the API, not connect directly to PostgreSQL or Redis.

## 1. Understand the local setup

The current [docker-compose.yml](../docker-compose.yml) starts PostgreSQL and
Redis only. It publishes PostgreSQL on host port `5441` and Redis on host port
`6385`. The Express API uses port `3003` when `PORT=3003` is set, and the Next.js
development server normally uses port `3000`.

For the simplest development setup:

1. Start PostgreSQL and Redis from this API project's root:

   ```powershell
   npm run docker-up
   ```

2. Configure the API's root `.env` as described below, then start the API:

   ```powershell
   npm run dev
   ```

3. In a separate terminal, start the Next.js app:

   ```powershell
   npm run dev
   ```

Check that the API is reachable at `http://localhost:3003/api/health`. The
actual URL depends on the API's `PORT`.

## 2. Keep configuration in environment files

Use the API project's root `.env` for backend settings. Do not commit it or put
its secrets in the Next.js app. The API validates its settings in
[src/config/env.ts](../src/config/env.ts); several integrations are required
even if you are not using their UI features yet.

Ensure the API project's `.gitignore` excludes `.env`. Next.js normally
excludes `.env.local`; check that it does too. Commit a placeholder
`.env.example` if you want to document required names, but never copy real
credentials into that example.

The following is a template, not a replacement for your existing `.env`.
Use values that match your local Docker setup:

```env
PORT=3003
NODE_ENV=development
LOG_LEVEL=debug

POSTGRES_USER=postgres
POSTGRES_PASSWORD=replace-with-a-local-password
POSTGRES_DB=nodejs-capstone
POSTGRES_PORT=5441
REDIS_PORT=6385

# The API runs on your computer, outside Docker, so use localhost and
# the published host ports.
DATABASE_URL=postgres://postgres:replace-with-a-local-password@localhost:5441/nodejs-capstone
REDIS_URL=redis://localhost:6385

JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=30m

CLOUDINARY_CLOUD_NAME=replace-me
CLOUDINARY_API_KEY=replace-me
CLOUDINARY_SECRET=replace-me

GOOGLE_CLIENT_ID=replace-me
GOOGLE_CLIENT_SECRET=replace-me
GOOGLE_CALLBACK_URL=http://localhost:3003/api/auth/google/callback
```

The Compose file does not currently read the `POSTGRES_*` and `*_PORT` values
above; its credentials and port mappings are written directly in the file.
To make those Compose settings configurable, change the `postgres` service to
use:

```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER:-postgres}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env}
  POSTGRES_DB: ${POSTGRES_DB:-nodejs-capstone}
ports:
  - "${POSTGRES_PORT:-5441}:5432"
```

And change the `redis` service port mapping to:

```yaml
ports:
  - "${REDIS_PORT:-6385}:6379"
```

Compose reads the root `.env` for `${...}` substitutions. The API separately
loads that file through dotenv. Keep `DATABASE_URL`'s username, password,
database name, and host port in sync with the PostgreSQL Compose settings.
Likewise, `REDIS_URL`'s port must match the Redis host port.

In the Next.js project, create `.env.local`:

```env
# Browser-accessible API base URL; include /api exactly once.
NEXT_PUBLIC_API_URL=http://localhost:3003/api
```

Restart Next.js after changing environment variables. `NEXT_PUBLIC_` values
are bundled for use in the browser, so this variable must contain only a
public API URL. Never put database URLs, Redis URLs, JWT secrets, Cloudinary
secrets, or Google client secrets in the Next.js environment.

If Compose later runs the API in a container, its database and Redis URLs
must use Compose service DNS names and container ports, not `localhost` or
published host ports:

```env
DATABASE_URL=postgres://postgres:replace-with-a-local-password@postgres:5432/nodejs-capstone
REDIS_URL=redis://redis:6379
```

Inside an API container, `localhost` refers to that API container itself.
The browser still needs a URL it can reach, such as
`http://localhost:3003/api`; it cannot resolve Docker-only names such as
`api` or `postgres`.

## 3. API routes the UI can call

All routes are prefixed with `/api`. Successful responses use JSON and
generally include `success`, with returned values under `data`.

| Feature | Method and path | Authentication | Request |
| --- | --- | --- | --- |
| Health check | `GET /api/health` | No | — |
| Register | `POST /api/auth/register` | No | `{ "email": "...", "password": "..." }` |
| Log in | `POST /api/auth/login` | No | `{ "email": "...", "password": "..." }` |
| Google login | `GET /api/auth/google` | No | Browser navigation/redirect |
| Current user | `GET /api/auth/me` | Admin token | Bearer token |
| List tasks | `GET /api/tasks` | User token | Bearer token |
| Create task | `POST /api/tasks` | User token | `{ "title": "..." }` |
| Get task | `GET /api/tasks/:taskId` | User token | Bearer token |
| Rename task | `PATCH /api/tasks/:taskId` | User token | `{ "title": "..." }` |
| Delete task | `DELETE /api/tasks/:taskId` | User token | Bearer token |
| Admin task list | `GET /api/admin/tasks` | Admin token | Optional `search` and `status` query parameters |
| Admin task status | `PATCH /api/admin/tasks/:taskId/status` | Admin token | `{ "status": "IN_PROGRESS" }` |
| Admin users | `GET /api/admin/users` | Admin token | Bearer token |
| List banners | `GET /api/admin/banners` | Admin token | Bearer token |
| Upload banner | `POST /api/admin/banners` | Admin token | Multipart form field named `image` |
| Delete banner | `DELETE /api/admin/banners/:bannerId` | Admin token | Bearer token |

Task statuses are `OPEN`, `IN_PROGRESS`, and `RESOLVED`. Task titles must be
3–150 characters. Passwords must be at least 6 characters. Banner uploads
must be images and are limited to 10 MB.

Important behavior in the current API:

- Registration returns a success message but does **not** log the user in.
  Follow registration with `POST /api/auth/login`.
- Login returns the token as `data.accessToken`. Send it on protected requests
  as `Authorization: Bearer <token>`.
- `/api/auth/me` is currently protected by both authentication and the admin
  role check. It is not available to ordinary users.
- Admin routes require a user whose role is already `admin`; the API does not
  provide an endpoint for changing a user's role.
- Google login starts with a browser navigation to `/api/auth/google`. Its
  callback currently returns JSON from the API rather than redirecting to a
  Next.js page.

## 4. Add a small typed API helper

In the Next.js project, add a helper such as `src/lib/api.ts` (adjust the
location to match your project's aliases). This keeps the base URL, bearer
header, JSON handling, and API errors in one place:

```ts
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseUrl) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const result = (await response.json()) as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(result.message ?? `API request failed (${response.status})`);
  }

  return result;
}
```

This helper expects API responses to be JSON, as the current routes do. For
file uploads, pass a `FormData` body and do not set `Content-Type` yourself;
the browser must add the multipart boundary.

## 5. Wire login and a task list

Login from a client-side form or event handler:

```ts
const result = await apiRequest<{ accessToken: string }>("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});

const token = result.data?.accessToken;
if (!token) {
  throw new Error("The login response did not include an access token");
}
```

Use the token for task requests:

```ts
type Task = {
  id: string;
  title: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

const result = await apiRequest<{ tasks: Task[] }>("/tasks", {}, token);
const tasks = result.data?.tasks;
if (!tasks) {
  throw new Error("The task response did not include a task list");
}
```

The API currently accepts bearer tokens; it does not set an authentication
cookie or provide a refresh-token route. Keeping the token only in React
memory is simpler and avoids persistent browser storage, but users will need
to log in again after a reload. Persisting it in `localStorage` survives
reloads but increases the impact of a cross-site scripting bug. If you choose
that approach for a learning project, avoid rendering untrusted HTML and keep
dependencies current. For a production app, consider adding a backend
session/HTTP-only cookie flow rather than exposing long-lived credentials to
browser JavaScript.

Use the API from client-side event handlers for this bearer-token flow. A
Next.js server component does not automatically have the browser's token.
If you later add a server-side proxy or server actions, keep any server-only
configuration in non-`NEXT_PUBLIC_` variables.

For creating, renaming, and deleting tasks:

```ts
await apiRequest<{ task: Task }>("/tasks", {
  method: "POST",
  body: JSON.stringify({ title }),
}, token);

await apiRequest<{ task: Task }>(`/tasks/${taskId}`, {
  method: "PATCH",
  body: JSON.stringify({ title }),
}, token);

await apiRequest<never>(`/tasks/${taskId}`, {
  method: "DELETE",
}, token);
```

After a mutation, update or refetch the task list so the UI reflects the
server's response. Use the response's `data.task` when the route returns one.

## 6. Build the screens with shadcn/ui

A practical order is:

1. **Login/register** — use shadcn `Input`, `Label`, `Button`, and `Card`.
   Show validation and API error messages next to the form.
2. **Tasks** — fetch the authenticated user's tasks, add a task form, and
   provide rename/delete actions. Show loading, empty, and error states.
3. **Admin tasks/users** — call the admin routes with an admin token. The
   admin task list accepts `search` and `status`, for example
   `/admin/tasks?search=printer&status=OPEN`.
4. **Banners** — render the `image_url` values returned by the banner list.
   Upload using `FormData` with the field name `image`; do not JSON-encode a
   file.

For a banner upload:

```ts
const formData = new FormData();
formData.append("image", file);

await apiRequest<{ banner: unknown }>("/admin/banners", {
  method: "POST",
  body: formData,
}, token);
```

Restrict admin screens in the UI for a better experience, but do not treat
client-side route guards as authorization. The API's authentication and role
middleware is what protects data and actions.

## 7. Troubleshooting

- **Browser reports a network or CORS error:** confirm the API is running and
  the URL in Next.js `.env.local` is reachable from the browser. The current
  Express app uses permissive CORS; for deployment, restrict it to the actual
  frontend origin.
- **API returns 401/403:** check that the request includes
  `Authorization: Bearer <accessToken>` and that the account is an admin for
  admin routes.
- **API cannot connect to PostgreSQL/Redis:** if the API runs on your computer,
  use `localhost` plus the published host ports. If it runs inside Compose,
  use `postgres:5432` and `redis:6379`.
- **Database login fails:** make the user, password, database name, and
  published port in `DATABASE_URL` match the Compose configuration. Changing
  PostgreSQL's initial credentials does not change credentials already stored
  in an existing Docker volume.
- **A changed Next.js URL has no effect:** restart the Next.js development
  server after editing `.env.local`.
- **Google login fails:** verify the callback URL is registered with Google
  and exactly matches `GOOGLE_CALLBACK_URL`.

## Existing implementation references

- [API route mounting](../src/routes/index.ts)
- [Authentication routes](../src/routes/auth.routes.ts)
- [User task routes](../src/routes/user.task.routes.ts)
- [Admin task routes](../src/routes/admin.task.routes.ts)
- [Admin user routes](../src/routes/admin.users.routes.ts)
- [Admin banner routes](../src/routes/admin.banner.routes.ts)
- [Environment validation](../src/config/env.ts)
