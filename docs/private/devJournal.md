# Forged — Dev Journal

Backend Architecture Decisions

1. Three Layer Architecture
   Separated the backend into three distinct layers — controller, service, repository. Each layer has one responsibility and does not reach into another layer's internals.
   - Controller — HTTP only. Reads request, sends response.
   - Service — business logic and rules of the app.
   - Repository — database reads and writes only.

Why it matters: changing the database, swapping a library, or reusing logic does not cascade changes across the entire codebase.

2. Provider Pattern for External Services
   Email sending is extracted into its own provider module. The auth service depends on the contract, not the concrete implementation.
   Why it matters: swapping email providers requires no changes to business logic.

3. Contracts via Interfaces
   Modules communicate through TypeScript interfaces, not direct imports of each other. This is dependency inversion.
   Why it matters: modules are truly swappable. Neither side knows the other's internals.

4. How Modules Were Decided
   Identified modules by listing CRUD entities, separating entities from fields, and grouping by reason to change. Final modules — auth, user, quests, days, categories.
   Why it matters: demonstrates domain driven thinking, not page driven thinking.

5. Categories as a Module
   Categories are fixed in v1 but given their own module and database table in anticipation of custom categories in v2.
   Why it matters: demonstrates forward thinking without over engineering the current version.

6. Rank lives on Day, Streak lives on User
   Rank is a snapshot of daily performance, so it is a field on the day entity. Streak spans across days so it belongs on the user.
   Why it matters: correct entity ownership prevents data modelling mistakes downstream.

# Database Schema Design — Dev Journal

## ORM & Database Decisions

### Prisma 7 + Supabase (PostgreSQL)

- Prisma 7 introduced `prisma.config.ts` — connection URLs no longer live in `schema.prisma`
- `prisma.config.ts` sits at the root of the backend folder, outside `src`
- `tsconfig.json` required two changes to accommodate this:
  - `rootDir` changed from `./src` to `./`
  - `include` updated to `["src", "prisma.config.ts"]`
- Supabase provides the hosted PostgreSQL database
- Connection URL goes in `prisma.config.ts` via Prisma's type safe `env()` helper

---

## How the Schema Was Decided

### Step 1 — List all nouns with CRUD operations

Start by listing everything the app needs to store. Do not filter yet.

### Step 2 — Separate entities from fields

Ask for each noun — does it have its own identity that other things reference? If yes, it is a table. If it is just a property of something else, it is a column.

### Step 3 — No embedded arrays

MongoDB allows embedding arrays inside documents. PostgreSQL does not work that way. Every relationship becomes a foreign key on a separate table.

### Step 4 — Relations need both sides

Every foreign key relation in Prisma requires:

- The FK field on the child model — `userId String`
- The relation field on the child model — `user User @relation(...)`
- The reverse relation on the parent model — `days Day[]`

---

## Schema Decisions and Reasoning

### User

- `password` is optional — Google OAuth users have no password
- `googleId` is optional and unique — only set for OAuth users
- `streak` lives on user — it spans across days, not specific to one day
- `isVerified` — tracks whether email verification is complete

### VerificationToken

- One table handles both email verification and password reset
- `type` enum — `EMAIL_VERIFICATION` or `PASSWORD_RESET` — distinguishes the two flows
- `isUsed` boolean prevents a token from being reused after it has been consumed
- `expiresAt` has no default — the service calculates `now + 30 minutes` and passes it in

### Category

- Fixed in v1 — Body, Mind, Wealth
- Given its own table and module to support custom categories in v2
- Categories are not an enum in the database because they need to be extensible

### MainQuest

- Separate from Task because they have different shapes and lifecycles
- A main quest spans weeks or months, has a deadline, is one per category
- A task is a daily action, belongs to a specific day
- Different shapes and different lifecycles means different tables

### Day

- Represents a single day for a specific user
- `completionRate` is a `Float` not `Int` — supports percentages like `87.5`
- `rank` is an enum — `D, C, B, A, S, SS, SSS`
- Composite unique constraint `@@unique([userId, date])` — one day record per user per date. Global `@unique` on date would prevent two users having a record for the same date.
- Has a one to one optional relation with `Reflection`

### Task

- `difficulty` enum — `EASY, MEDIUM, HARD` — drives the scoring system
- Belongs to a day via `dayId` FK — replaces the embedded array approach from MongoDB
- Also belongs to a category via `categoryId` FK

### Reflection

- Optional — a day can exist without a reflection
- All three fields `right`, `wrong`, `improve` are optional — user may only fill some
- One to one with Day — one reflection per day

---

## Off Day Decision

Considered multiple approaches:

- Manual toggle with one per week limit
- Configurable off days per week in settings
- Automatic detection with grace period

**Final decision — automatic streak logic, no off day feature:**

- No tasks added for a day — treated as an off day, streak intact
- Two consecutive days with no tasks — streak resets
- No manual toggle, no settings, no extra columns needed
- Grace period — user has until end of next day to mark yesterday's tasks as completed
- This is enforced in the service layer using date calculations, not database columns

**Reasoning:** The streak itself is the accountability mechanism. Adding manual off day controls creates opportunity for abuse and over-complicates a simple concept.

---

## Rank System

- Rank is stored on `Day` as an enum — it is a snapshot of that day's performance
- Rank titles like "D — Drifter", "A — Annihilator" are constants in code, not a database table
- Fixed data that never changes belongs in code, not the database
- Will live in `src/shared/utils/ranks.ts`

---

## Prisma Concepts Reference

### `@default(cuid())`

Prisma auto generates a unique string ID for every new record.

### `@updatedAt`

Prisma automatically updates this field every time the record changes.

### `@@unique([field1, field2])`

Composite unique constraint — the combination of both fields must be unique, not each field individually.

### Relations

Every relation needs three things:

- FK field — `userId String`
- Relation field with decorator — `user User @relation(fields: [userId], references: [id])`
- Reverse relation on the parent — `days Day[]`

The relation field is not a real database column. It is a virtual field Prisma uses to let you navigate between models in code.

### `include` in queries

By default Prisma only returns the model's own fields. To get related data you use `include`:

```ts
const day = await prisma.day.findUnique({
  where: { id: dayId },
  include: { tasks: true, reflection: true },
});
```
