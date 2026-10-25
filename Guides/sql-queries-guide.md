# SQL Inspection Guide

This note explains how to connect to the PostgreSQL database in this project and run SQL queries to inspect what tables already exist.

## Database connection details

The app reads its database address from [.env](../.env):

```env
DATABASE_URL='postgresql://postgres:postgres@localhost:5441/nodejs-capstone-practice'
```

That means:

- host: `localhost`
- port: `5441`
- username: `postgres`
- password: `postgres`
- database: `nodejs-capstone-practice`

## Connect from a local shell

If the PostgreSQL client is installed locally, connect with:

```bash
psql -h localhost -p 5441 -U postgres -d nodejs-capstone-practice
```

When prompted, enter:

```text
postgres
```

You are now inside the database shell.

## Useful table inspection commands

Inside `psql`, run:

```sql
\dt
```

That lists the tables in the current database.

To inspect one table:

```sql
\d users
```

```sql
\d support_tasks
```

```sql
\d banners
```

## Read table contents

To check the rows in a table:

```sql
SELECT * FROM users;
```

```sql
SELECT * FROM support_tasks;
```

```sql
SELECT * FROM banners;
```

## Inspect the schema

To list all tables with their schema information:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

To see column names and types for a table:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

## Connect through the Docker container instead

You can also inspect the DB from inside the container:

```bash
docker exec -it nodejs-practice-postgres psql -U postgres -d nodejs-capstone-practice
```

Then run the same commands shown above:

```sql
\dt
SELECT * FROM users;
SELECT * FROM support_tasks;
SELECT * FROM banners;
```

## Migration table queries

If you want to inspect whether migration metadata exists, run:

```sql
SELECT * FROM pgmigrations;
```

If your older notes used a `migrations` table name, you can also try:

```sql
SELECT * FROM migrations;
```

That tells you whether the migration history was recorded in the database.
