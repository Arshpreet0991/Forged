# Auth in Express

## work flow

we will follow these steps to finish the auth. Each layer depends on the one below it. Controller depends on service, service depends on repository. So we build from the bottom up

- `Auth contracts` — define the TypeScript interfaces first. What does a register request look like, what does a login request look like.
- `Auth repository` — database operations. Find user by email, create user, save refresh token.
- `Auth service` — business logic. Hash password, verify code, generate tokens. Calls the repository and email provider.
- `Auth controller` — reads the request, calls the service, sends the response.
- `Auth routes` — maps URLs to controller functions.
- Register routes in app.ts — wire everything together.

### Auth Contracts

- Contracts are TS interfaces that defines the shape of the data flowing between layers.
- For eg, for auth- one of the contracts will be what data is sent fromt he front end to backend for registering a user.

```ts
interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  username: string;
}
```

- In our case, since we are using zod, we dont need to define contracts explictly.
- Instead, we will create zod schema, and export the type using `z.infer`.
- So we only create, response contract, as request contract is covered by zod.

### Creating Auth repository

- auth repository only contains the db connections.
- so our service layer will send data to repository layer, to make queries to database.
- we will create some functions here to perform db operations.
- repo layer functions are named based on the operation that they do, and does not show what is the business logic, so for example:
  - the funtion to register user, should be called createUser and not register user.
  - login user should be find userbyEmail.
- this is so that make the repo layer generic to call for whatever CRUD op we need to do.

### Creating Tokens using JWT

- We will be creating 2 types of tokens here. Both the tokens are generated the same way by using `jwt.sign` method. The only difference is their expiry time.
  - Access Token : short lived , issued to user, not stored in DB.
  - Refresh Token: long lived, issued to user and stored in DB.
- The idea is, a user must have an Access token in order to access any protected route. But since access token is short-lived then, it might expire in lets say 15-minutes. Then after 15 minutes, we need to enter our username and password again to get a new access token.
- But, if we have a refresh token, which is issued to the user and the is in the DB.
- Now if we hit an endpoint of a protected route, and we amtch the uers refresh token with the db, if it matches we issue a new access token to user. Thus, eliminating the need to log in again and again.

# Creating Tokens using JWT

- We create 2 types of tokens. Both are generated using `jwt.sign`. The difference is their secret, expiry, and where they are stored.
  - Access Token — short lived (e.g. 15 minutes), sent to the client, never stored on the server.
  - Refresh Token — long lived (e.g. 7 days), sent to the client AND stored in the database on the user record.

- A user must send the access token with every request to hit a protected route. The auth middleware verifies it and extracts the user id from the payload.

- When the access token expires, instead of asking the user to log in again, the client sends the refresh token to a dedicated `/auth/refresh` endpoint.

- The server checks if the refresh token exists in the database and matches the one stored on the user. If it matches, a new access token is issued. The user stays logged in without re-entering credentials.

- If the refresh token is also expired or not found in the database, the user must log in again.

- The payload inside the token contains the `userId`. This is what the auth middleware extracts to identify the user on each request.

```

```
