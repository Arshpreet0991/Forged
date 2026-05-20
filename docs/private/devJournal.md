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
