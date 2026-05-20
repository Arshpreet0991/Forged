# Backend Project Setup Guide

## 1. Prerequisites

- Node.js installed
- PostgreSQL installed
- VS Code with TypeScript extension

---

## 2. Initialize the Project

- Create your project folder and a `backend` folder inside it
- Run `npm init -y` inside `backend`
- Initialize git at the **root** of the project, not inside `backend`

```bash
git init
git branch -M main
```

- Create `.gitignore` at the root immediately

```
node_modules/
dist/
.env
logs/
```

---

## 3. Install TypeScript and Dev Tooling

Install as dev dependencies:

- `typescript` — the TypeScript compiler
- `ts-node-dev` — runs TypeScript directly in development with auto-restart

```bash
npm install -D typescript ts-node-dev
```

Generate `tsconfig.json`:

```bash
npx tsc --init
```

Replace the generated config with this clean Node.js config:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

Key options explained:

- `target: ES2020` — compile to a Node.js compatible JavaScript version
- `module: commonjs` — Node.js uses CommonJS, not ES modules
- `rootDir / outDir` — source lives in `src/`, compiled output goes to `dist/`
- `strict: true` — catches bugs at compile time
- `esModuleInterop: true` — allows clean `import x from 'y'` syntax

---

## 4. Install Core Dependencies

Production:

```bash
npm install express zod cors cookie-parser dotenv
```

Dev:

```bash
npm install -D @types/node @types/express @types/cors @types/cookie-parser
```

---

## 5. Set Up package.json Scripts

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

- `dev` — development server, fast restarts, skips type checking (editor handles that)
- `build` — compiles TypeScript to JavaScript for production with full type checking
- `start` — runs compiled output in production

---

## 6. Set Up Prettier

```bash
npm install -D prettier
```

Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all"
}
```

---

## 7. Create Folder Structure

```
src/
  config/
    env.ts
    logger.ts
  modules/
    auth/
    user/
    quests/
    days/
    categories/
  shared/
    errors/
    middlewares/
    providers/
    utils/
  app.ts
  server.ts
```

Each module contains five files:

```
module.routes.ts      — maps URLs to controller functions
module.controller.ts  — reads request, calls service, sends response
module.service.ts     — business logic and rules
module.repository.ts  — all database reads and writes
module.contracts.ts   — TypeScript interfaces for this module
```

---

## 8. Create .env

Add all environment variables as placeholders immediately:

```
NODE_ENV=development
PORT=5000
DATABASE_URL=
JWT_SECRET=
RESEND_API_KEY=
CORS_ORIGIN=*
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Rules:

- Never commit `.env`
- Always have a `.env.example` with empty values for teammates
- All variables go through `env.ts` — never access `process.env` directly in code

---

## 9. Set Up env.ts

- Import Zod
- Define a schema with `z.object()` for all env variables
- Use `z.infer<typeof envSchema>` to derive the TypeScript type from the schema
- Use `safeParse` to validate `process.env`
- If `result.success` is false, log `result.error.issues` and call `process.exit(1)`
- Export the validated env object

Key schema rules:

- `NODE_ENV` — use `z.enum(['development', 'production', 'test']).default('development')`
- `PORT` — use `z.string().default('5000').transform(Number)` to convert string to number
- Required fields use `.min(1)` to ensure they are not empty
- App fails immediately on startup if any required variable is missing — this is intentional

Why this matters: `process.env` returns everything as a string with no type safety. `env.ts` gives you a validated, typed config object with a single source of truth.

---

## 10. Set Up logger.ts

Install Winston:

```bash
npm install winston
```

Steps:

- Destructure `combine`, `timestamp`, `json`, `colorize`, `printf` from `format`
- Create a `consoleLogFormat` using `combine`, `colorize`, and `printf` for readable terminal output
- Create the logger with `createLogger`:
  - Level: `debug` in development, `info` in production based on `env.NODE_ENV`
  - Format: `combine(timestamp(), json())` — for file transports only, no colorize
  - Transports: file transport for `logs/error.log` (errors only) and `logs/combined.log` (all logs)
- Add Console transport only in development using `logger.add()`

```ts
if (env.NODE_ENV !== "production") {
  logger.add(new transports.Console({ format: consoleLogFormat }));
}
```

When to use each level:

- `logger.error` — something broke, always in catch blocks
- `logger.warn` — unexpected but app can continue
- `logger.info` — significant events, server started, user registered
- `logger.debug` — internal details useful during development only

Important: never use `console.log` in the codebase after this is set up.

---

## 11. Set Up app.ts

- Create Express app
- Register middleware in this order:
  - `express.json()`
  - `express.urlencoded({ extended: true })`
  - `cookieParser()`
  - `cors({ origin: env.CORS_ORIGIN, credentials: true })`
- Export the app
- Never call `app.listen` here — that belongs in `server.ts`
- Register module routes here as they are built

Why separate `app.ts` from `server.ts`: tests import `app.ts` directly without starting the server. If `app.listen` was in `app.ts`, every test run would start a real server on a port.

---

## 12. Set Up server.ts

- `import 'dotenv/config'` must be the absolute first line before all other imports
- Import app, env, and logger
- Call `app.listen(env.PORT)`
- Log server start with `logger.info`

Why dotenv must be first: it loads `.env` into `process.env`. If anything else imports before it, `process.env` will be empty when `env.ts` tries to validate it.

---

## 13. First Git Commit

```bash
git add .
git commit -m "chore: initial project setup"
git remote add origin <your repo URL>
git push -u origin main
```

---

## Architecture Reference

### How to Decide Modules

1. Forget pages — the backend only knows about data and operations on data
2. List all nouns that have CRUD operations
3. Separate entities from fields — does it have its own identity that other things reference?
4. Belonging is a relationship, not the same as being a field
5. Group by reason to change — would changes only affect things within this group?
6. Consider future boundaries even if simple now

### Three Layer Architecture

- **Controller** — HTTP only. Reads request, sends response. Nothing else.
- **Service** — business logic. The rules of the app. Orchestrates the flow.
- **Repository** — database reads and writes only. No business logic.

### Provider Pattern

External services get their own provider module in `shared/providers/`. The service depends on the provider's contract, not the concrete implementation. Swapping providers requires no changes to business logic.

### Contracts

Define TypeScript interfaces that describe what functions exist, what parameters they take, and what they return. Modules depend on contracts, not on each other directly. This is dependency inversion — it is what makes layers truly swappable.
