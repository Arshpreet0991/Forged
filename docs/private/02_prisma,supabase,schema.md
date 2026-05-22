# Prisma Setup Reference Guide

## Overview

Prisma is a TypeScript ORM that gives you type safe database queries. Instead of writing raw SQL, you define your models in a schema file and Prisma generates a fully typed client to interact with the database.

Three core pieces:

- `schema.prisma` — defines your models and database provider
- `prisma.config.ts` — configures the database connection URL and migration paths
- `PrismaClient` — the generated client you use in your code to query the database

---

## Installation

```bash
npm install -D prisma
npm install @prisma/client
```

---

## Initialization

```bash
npx prisma init --datasource-provider postgresql
```

This creates:

- `prisma/schema.prisma` — your schema file
- `prisma.config.ts` — your config file (Prisma 7+)

---

## Prisma 7 — Important Changes

Prisma 7 moved connection URLs out of `schema.prisma` and into `prisma.config.ts`.

**`schema.prisma` datasource block — no URL:**

```prisma
datasource db {
  provider = "postgresql"
}
```

**`prisma.config.ts` — URL lives here:**

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

**`tsconfig.json` changes required:**

Since `prisma.config.ts` sits outside `src`, TypeScript needs to be able to see it:

```json
{
  "compilerOptions": {
    "rootDir": "./"
  },
  "include": ["src", "prisma.config.ts"]
}
```

---

## Connecting to Supabase

Supabase provides multiple connection strings. For Prisma 7 you only need one — the Session Pooler URL.

Go to your Supabase dashboard → Connect → ORM → Prisma. Copy the `DATABASE_URL` and add it to your `.env`.

```
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

Use Prisma's `env()` helper in `prisma.config.ts`, not `process.env` directly.

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
- `@default(uuid())` — auto generates a UUID
- `@default(now())` — sets timestamp to current time on creation
- `@updatedAt` — automatically updates on every change
- `@unique` — enforces uniqueness at database level

### Optional fields

Add `?` to make a field nullable:

```prisma
password String?
googleId  String? @unique
```

### Enums

Define above the model that uses them:

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

A user has many tasks:

```prisma
// On the child model (Task)
userId String
user   User   @relation(fields: [userId], references: [id])

// On the parent model (User)
tasks Task[]
```

Rules:

- `userId` — the actual FK column stored in the database
- `user` — virtual field, not a real column, lets you navigate to the related user in code
- `tasks` — reverse relation on User, required by Prisma, not a real column

### Relations — one to one

A day has one reflection:

```prisma
// On Reflection
dayId String
day   Day    @relation(fields: [dayId], references: [id])

// On Day
reflection Reflection?
```

The `?` on the reverse side means the relation is optional.

### Composite unique constraint

Use when uniqueness depends on a combination of fields:

```prisma
model Day {
  userId String
  date   DateTime
  @@unique([userId, date])
}
```

This means one user cannot have two day records for the same date, but two different users can share the same date.

---

## Migrations

A migration is a versioned file that records a change to your database structure. Prisma tracks these and applies them in order.

### Run a migration in development

```bash
npx prisma migrate dev --name descriptive-name
```

This:

1. Compares your schema to the current database state
2. Generates a SQL migration file in `prisma/migrations/`
3. Applies the migration to your database
4. Regenerates the Prisma client

### Apply migrations in production

```bash
npx prisma migrate deploy
```

This applies all pending migrations without generating new ones.

### Regenerate the client without migrating

```bash
npx prisma generate
```

Run this after any schema change if you do not want to run a full migration yet.

---

## PrismaClient Setup

Create a single shared Prisma client instance. Do not instantiate it in every file.

Create `src/config/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const prisma = new PrismaClient();

export default prisma;
```

Import this single instance in your repository files:

```ts
import prisma from "../../config/prisma";
```

---

## Querying Reference

### Find one

```ts
const user = await prisma.user.findUnique({
  where: { id: userId },
});
```

### Find many

```ts
const tasks = await prisma.task.findMany({
  where: { dayId: dayId },
});
```

### Create

```ts
const user = await prisma.user.create({
  data: {
    email,
    username,
    password: hashedPassword,
  },
});
```

### Update

```ts
const user = await prisma.user.update({
  where: { id: userId },
  data: { streak: { increment: 1 } },
});
```

### Delete

```ts
await prisma.user.delete({
  where: { id: userId },
});
```

### Include relations

```ts
const day = await prisma.day.findUnique({
  where: { id: dayId },
  include: {
    tasks: true,
    reflection: true,
  },
});
```

---

## Useful CLI Commands

| Command                     | What it does                                          |
| --------------------------- | ----------------------------------------------------- |
| `npx prisma migrate dev`    | Create and apply a migration in development           |
| `npx prisma migrate deploy` | Apply pending migrations in production                |
| `npx prisma generate`       | Regenerate the Prisma client                          |
| `npx prisma studio`         | Open a visual database browser                        |
| `npx prisma db push`        | Push schema changes without creating a migration file |
| `npx prisma migrate reset`  | Reset the database and rerun all migrations           |
