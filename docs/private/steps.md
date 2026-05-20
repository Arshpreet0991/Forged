# Steps that i followed through out the project

- create a folder named `backend`
- on terminal, cd to backend and type `npm init`
- install typescript as it is not understood by node by default `npm install -D typescript`
- install ts-node-dev package. This is nodemon like package for typescript. `npm install -D ts-node-dev `
- create `tsconfig.json` in backend root. see the code added there.
- create `src` folder in back
- install express and zod. `npm install express zod`
- install their types as dev dependencies. `npm install -D @types/node @types/express`
- create these folders in `src`
  - `src/ config` : anything related to configuration. Environment variables, database connection, logger setup. Things that are set once and used across the app.
  - `src/ modules`: this is where your features live. Each feature gets its own folder. Auth, quests, scoring etc. Each module contains its own controller, service, repository and routes. Self contained.
  - `src/ shared`: code that is not specific to any one module but is used across many. Contracts, middleware, utility functions, error classes.

### Figure out Modules

Here is the process:

- `Forget pages` — pages are a frontend concern. The backend only knows about data and operations on data.
- `List your nouns` — what are the things in your app that get created, read, updated or deleted? List them all out without filtering.
- `Separate entities from fields` — ask for each noun, does this have its own identity that other things reference? Or is it just a property sitting on another entity? Deadlines, completion rates, streaks — these are fields. Users, quests, days — these are entities.
- `Check ownership` — if one entity belongs to another, that does not make it a field. A quest belongs to a category, but both have their own identity. Belonging is a relationship, not the same as being a field.
- `Group by reason to change` — would changes to this feature only affect things within this group? If yes, it is a module.
- `Look for future boundaries` — even if something is simple now, if it has a realistic chance of growing its own logic later, give it its own module. Categories is a good example.

#### Inside Modules

- each module will have some files which are based on separation of concerns. for example, the auth module will have:
- `auth.route.ts`: maps HTTP methods and URLs to controller functions
- `auth.controller.ts`: reads the request, calls the service, sends the response
- `auth.service.ts` : contains business logic and rules, orchestrates the flow
- `auth.repository.ts` : all database reads and writes for this module
- `auth.contracts.ts` : TypeScript interfaces defining the shape of data and function signatures for this module

### Create shared folder structure

Inside shared, create these folders

- `middleware/` — auth middleware and anything else that runs between request and response across multiple modules
- `providers/` — email provider and later anything else that wraps an external service, Cloudinary for example
- `errors/` — custom error classes
- `utils/` — small reusable utility functions that do not belong to any specific module

### config folder

Inside config, we create these files

- `logger.ts` - logger setup to set up logs for production
- `env.ts`
  - we will import all .env variables here, and then validate them with zod and export them. So, we dont acces env variables directly with `process.env.SOMETHING`.
  - we are doing this because if an invalid env makes into the app, it crashes the whole app. So `env` are only imported from `env.ts`

### Create entry point inside the app in `src/`

we create two entry points:

- `app.ts` — creates and configures the Express app, registers middleware, registers routes. Exports the app.
- `server.ts` — imports the app and starts listening on a port.

- when you write tests with Supertest, it needs to import your Express app to make requests against it, but it should not actually start the server and listen on a port.
- So, Tests import app.ts directly without ever starting the server.

### setting up src/

**Package.json Scripts**

- `dev` — runs app in development using ts-node-dev. `--respawn` restarts on crash, `--transpile-only` skips type checking for faster startup. Type checking is handled by your editor.
- `build` — compiles TypeScript to JavaScript into the `dist/` folder. Run before deploying to production.
- `start` — runs the compiled JavaScript from `dist/`. This is what runs in production, not ts-node-dev.

**.env **

**.gitignore**

```js
  node_modules/
  dist/
  .env
```

**install prettier**

- npm install -D prettier
- create a `.prettierrc` file in root backend and add configurations.

### Setting up env.ts with zod validations

- step 1: Define a schema for environment variables using Zod
- step 2: Create a type of env variables based on the schema
- sstep 3: Validate and parse environment variables

### setting up advanced logger

`npm install winston`

- in config/logger.ts
  - create custom logger

### set up dotenv

- want the `.env` to populate the process.env, so we use this package for that.

### set up express

- npm install express
- npm install cookies:
  - cookie-parser
  - npm install -D @types/cookie-parser
- install cors:
  - npm install cors
  - npm install -D @types/cors
- import express, configure middlewares and export app. This is done in app.ts
