# node-pg-migrate Setup and Project Changes

This guide explains how to replace the handwritten migration runner in this project with `node-pg-migrate`.

## 1) Install the migration tool

Run:

```powershell
npm install --save-dev node-pg-migrate
```

The environment already has `pg`, so no new runtime database driver is required for the migration layer.

## 2) Add the migration scripts

Update the `scripts` section of `package.json` so the project calls `node-pg-migrate` instead of the custom launcher.

Example replacement:

```json
"scripts": {
  "build": "tsc",
  "dev": "tsx src/server.ts",
  "start": "node dist/server.js",
  "docker-up": "docker compose up -d",
  "docker-down": "docker compose down",
  "migrate": "npx node-pg-migrate up",
  "migrate:down": "npx node-pg-migrate down",
  "migrate:create": "npx node-pg-migrate create",
  "migrate:status": "npx node-pg-migrate status"
}
```

This is the direct package-level replacement for the existing custom migration runner.

## 2a) What each migration script does

The package scripts in `package.json` are shortcuts for the `node-pg-migrate` CLI that this project’s installed version supports:

```json
"migrate": "npx node-pg-migrate up",
"migrate:down": "npx node-pg-migrate down",
"migrate:create": "npx node-pg-migrate create",
"migrate:redo": "npx node-pg-migrate redo"
```

- `npm run migrate` runs `node-pg-migrate up` and applies any migration file that has not yet been recorded in the database history table.
- `npm run migrate:down` runs `node-pg-migrate down` and rolls back the most recently applied migration.
- `npm run migrate:create` creates a new migration skeleton file for the next database change.
- `npm run migrate:redo` runs the latest migration in reverse and then applies it again.

The tool reads migration SQL files from the `migrations/` folder and uses a table called `pgmigrations` inside PostgreSQL to remember what has already been executed. That table is created automatically by `node-pg-migrate` when it first records migration history. In the docs example it is described as `migrations`, but the installed version’s CLI help reports the default table name as `pgmigrations`.

## 3) Stop using the custom migration script

The file `src/scripts/migrate.ts` is a manual implementation that loads SQL files and tracks them itself.

Remove that file from the runtime path:

```text
src/scripts/migrate.ts
```

That file should be deleted or left unused once `node-pg-migrate` is configured.

## 4) Keep the SQL files in the current folder

The project already stores SQL definitions under the `migrations/` directory.

That folder can remain the migration source for `node-pg-migrate` as long as the migration files are framed in the tool’s expected format.

## 5) Optional project-level config

If you want to make the migration folder explicit, add a config file in the root.

Example:

```js
module.exports = {
  migrationTable: "migrations",
  dir: "migrations",
  direction: "up",
  log: true,
};
```

You can then point the CLI at that config when needed.

## 6) Run the standard migration commands

Make sure `DATABASE_URL` is available in the environment before running these commands:

```powershell
npm run migrate
```

Rollback the latest migration:

```powershell
npm run migrate:down
```

Create a new migration file:

```powershell
npx node-pg-migrate create add_users_table --sql-file
```

## 7) Files to replace or remove

- `package.json`
- `src/scripts/migrate.ts` (remove)
- optionally add `node-pg-migrate.config.js`

This is the migration-level replacement for the current custom script setup.
