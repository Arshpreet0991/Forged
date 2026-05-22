# Prisma 7 Complete Setup Guide (PostgreSQL + Supabase)

## What Are We Setting Up

Before touching any code, understand what the moving parts are and why each one exists.

### The Moving Parts

**`prisma` package** — the CLI tool. Used for generating the client, running migrations, and interacting with the database from the terminal. Install as a dev dependency.

**`@prisma/client` package** — the generated client your app uses at runtime to query the database. Install as a production dependency.

**`@prisma/adapter-pg` package** — Prisma 7 no longer has its own database driver. It now uses Node.js native drivers. For PostgreSQL, you need this adapter. Install as a production dependency.

**`schema.prisma`** — defines your data models, enums, and relationships. This is the blueprint of your database. Lives in a `prisma/` folder.

**`prisma.config.ts`** — Prisma 7 config file. Tells the Prisma CLI where your schema is, where to put migrations, and what database URL to use for CLI operations like migrations. Lives at the root of your backend folder alongside `package.json`.

**`prisma/generated/prisma/`** — where Prisma generates the client code after you run `prisma generate`. This is auto-generated, never edit it manually.

**`src/config/prisma.ts`** — your app's single shared Prisma client instance. All repository files import from here. Never instantiate PrismaClient in multiple places.

**Supabase** — the hosted PostgreSQL database. Provides connection strings for your app to connect to.

### How They Connect

```
schema.prisma         — defines the structure
      ↓
npx prisma generate   — generates the client from the schema
      ↓
prisma/generated/     — the generated client code
      ↓
src/config/prisma.ts  — wraps the client with the adapter and exports it
      ↓
repositories          — import prisma and use it to query the database
```

```
prisma.config.ts      — tells the CLI what database URL to use
      ↓
npx prisma migrate    — reads config, connects to db, runs the migration
      ↓
Supabase database     — tables are created based on schema.prisma
```

---

## Step 1 — Install Packages

```bash
# Dev dependency — CLI only, not needed in production
npm install -D prisma

# Production dependencies — needed at runtime
npm install @prisma/client @prisma/adapter-pg
```

---

## Step 2 — Initialize Prisma

```bash
npx prisma init --datasource-provider postgresql
```

This creates:

- `prisma/schema.prisma` — your schema file
- `prisma.config.ts` — your config file

If a `prisma/` folder already exists and is empty, delete it first then run again.

---

## Step 3 — Update schema.prisma

Prisma 7 uses a new generator. The client is no longer generated inside `node_modules` by default — you specify a custom output path.

```prisma
generator client {
  provider = "prisma-client"
  output   = "./generated/prisma"
}

datasource db {
  provider = "postgresql"
}
```

Note: No `url` in the datasource block. That moved to `prisma.config.ts`.

---

## Step 4 — Update prisma.config.ts

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Use Prisma's `env()` helper, not `process.env` directly.

---

## Step 5 — Update tsconfig.json

`prisma.config.ts` sits outside `src`. TypeScript needs two changes to see it:

```json
{
  "compilerOptions": {
    "rootDir": "./"
  },
  "include": ["src", "prisma.config.ts"]
}
```

---

## Step 6 — Supabase Setup

### Create a dedicated Prisma database user

Never use the default `postgres` user. Go to Supabase dashboard → SQL Editor and run:

```sql
create user "prisma" with password 'your_strong_password' bypassrls createdb;
grant "prisma" to "postgres";
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

Password rules — avoid `@`, `/`, `#` as they break the connection string URL.

### To drop the prisma user if needed

```sql
revoke all on all tables in schema public from prisma;
revoke all on all routines in schema public from prisma;
revoke all on all sequences in schema public from prisma;
revoke usage, create on schema public from prisma;
alter default privileges for role postgres in schema public revoke all on tables from prisma;
alter default privileges for role postgres in schema public revoke all on routines from prisma;
alter default privileges for role postgres in schema public revoke all on sequences from prisma;
revoke "prisma" from "postgres";
drop user "prisma";
```

### Get connection strings

Go to Supabase dashboard → Connect → Session Pooler. Copy the string and:

- Replace the username with `prisma`
- Replace the password with the one you created

```
DATABASE_URL="postgresql://prisma.[project-ref]:[prisma-password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

Add this to your `.env` file.

### Connection string types

| Type               | Port                | Use for                                      |
| ------------------ | ------------------- | -------------------------------------------- |
| Session Pooler     | 5432                | App queries and migrations                   |
| Transaction Pooler | 6543                | Serverless environments only                 |
| Direct             | 5432 on direct host | Often blocked by ISPs — avoid for migrations |

If you get `P1001: Can't reach database server` on the direct connection, your ISP is blocking port 5432 on that host. Use the Session Pooler instead.

If you get `prepared statement already exists` error, you are using the Transaction Pooler when you should be using the Session Pooler.

---

## Step 7 — Write Your Schema

Define your models in `schema.prisma`. See schema syntax reference below.

---

## Step 8 — Run the Migration

```bash
npx prisma migrate dev --name init
```

This:

1. Reads `prisma.config.ts` for the database URL
2. Compares your schema to the current database state
3. Generates a SQL migration file in `prisma/migrations/`
4. Applies the migration to your Supabase database
5. Regenerates the Prisma client automatically

---

## Step 9 — Generate the Client

If you need to regenerate without running a migration:

```bash
npx prisma generate
```

---

## Step 10 — Create the Shared PrismaClient Instance

Create `src/config/prisma.ts`:

```ts
import { PrismaClient } from "../../prisma/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
```

Note: The import path `../../prisma/generated/prisma/client` depends on where this file lives. Adjust accordingly.

Import this single instance in your repository files:

```ts
import prisma from "../../config/prisma";
```

---

## Schema Syntax Reference

### Basic model

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Common decorators

- `@id` — marks the primary key
- `@default(cuid())` — auto generates a unique string ID
- `@default(now())` — sets timestamp on creation
- `@updatedAt` — auto updates on every record change
- `@unique` — enforces uniqueness at the database level

### Optional fields

```prisma
password String?
googleId  String? @unique
```

### Enums

```prisma
enum TaskLevel {
  EASY
  MEDIUM
  HARD
}

model Task {
  difficulty TaskLevel
}
```

### Relations — one to many

```prisma
// Child model
userId String
user   User   @relation(fields: [userId], references: [id])

// Parent model
tasks Task[]
```

- `userId` — actual FK column stored in the database
- `user` — virtual field, lets you access the related record in code
- `tasks` — reverse relation on parent, required by Prisma

### Relations — one to one

```prisma
// Child model
dayId String @unique
day   Day    @relation(fields: [dayId], references: [id])

// Parent model
reflection Reflection?
```

`@unique` on the FK enforces one to one. `?` on the parent makes it optional.

### Composite unique constraint

```prisma
model Day {
  userId String
  date   DateTime
  @@unique([userId, date])
}
```

---

## Migration vs DB Connection

These are two separate things. Common point of confusion:

- **Migration** — a one time operation that creates or modifies tables in the database. Run from the terminal using the Prisma CLI.
- **DB connection** — your app connecting to the database at runtime to read and write data. Managed by `PrismaClient` through the adapter. Happens automatically on first query.

---

## Useful CLI Commands

| Command                              | What it does                              |
| ------------------------------------ | ----------------------------------------- |
| `npx prisma migrate dev --name name` | Create and apply migration in development |
| `npx prisma migrate deploy`          | Apply pending migrations in production    |
| `npx prisma generate`                | Regenerate the Prisma client              |
| `npx prisma studio`                  | Open a visual database browser            |
| `npx prisma db push`                 | Push schema without a migration file      |
| `npx prisma migrate reset`           | Reset database and rerun all migrations   |
