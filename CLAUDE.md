# Dayflow AI Development Instructions

## 1. Project

Dayflow is a Human Resource Management System (HRMS).

The project requirements and implementation decisions are defined in:

1. `docs/SRS.md` — product requirements
2. `docs/ARCHITECTURE.md` — software architecture
3. `docs/TECH_STACK.md` — technology stack
4. `docs/PROGRESS.md` — current implementation status

These documents must be read before implementing a feature.

---

## 2. Source of Truth

Follow this priority:

1. `docs/SRS.md` — WHAT the product must do
2. `docs/ARCHITECTURE.md` — HOW the software is structured
3. `docs/TECH_STACK.md` — WHAT technologies are used
4. Existing working code
5. `docs/PROGRESS.md` — current project status

Do not invent product requirements when the SRS does not specify them.

If a requirement is ambiguous, stop and explain the ambiguity instead of silently inventing behavior.

---

## 3. Technology Rules

Use the finalized technology stack.

### Frontend

- React
- Vite
- React Router
- Tailwind CSS
- TypeScript

### Backend

- Node.js
- Express
- TypeScript

### Database

- PostgreSQL
- Prisma

### Authentication

- JWT
- HttpOnly cookies
- bcrypt

### Validation

- Zod

### API

- REST
- Browser Fetch API

### Development

- Git
- GitHub
- ESLint
- Prettier

Do not introduce additional frameworks or libraries unless there is a concrete requirement that cannot reasonably be implemented with the existing stack.

If a new dependency is genuinely necessary, explain:

1. Why it is needed
2. What problem it solves
3. Why the existing stack cannot reasonably solve it

Do not install it without approval.

Do not introduce:

- Microservices
- GraphQL
- Redis
- Kafka
- Multiple databases
- Redux
- Firebase authentication
- Supabase authentication
- Unnecessary UI/component libraries

---

## 4. Architecture Rules

The application is a modular monolith.

The architecture is:

React
↓
REST API
↓
Node.js + Express
↓
Prisma
↓
PostgreSQL

Do not replace this architecture without explicit approval.

Keep frontend and backend responsibilities separate.

Follow `docs/ARCHITECTURE.md`.

---

## 5. Backend Rules

Backend authorization is the actual security boundary.

Never trust:

- frontend role checks
- client-provided roles
- client-provided privileged user IDs
- hidden UI buttons
- frontend validation

Every protected API operation must independently verify authentication and authorization.

Business logic belongs in backend services.

Controllers should remain thin.

Routes should define:

- HTTP method
- endpoint
- middleware
- controller

Services should contain business rules.

Use Zod for backend input validation.

Use Prisma for database access.

---

## 6. Authentication Rules

Never:

- store plaintext passwords
- expose password hashes
- store authentication tokens in localStorage
- hardcode JWT secrets
- commit secrets to Git

Use:

- bcrypt for password hashing
- JWT for authentication
- HttpOnly cookies for authentication cookies
- environment variables for secrets

Authentication must be implemented on the backend.

---

## 7. Database Rules

Use PostgreSQL through Prisma.

Database schema changes must be made through Prisma migrations.

Do not:

- replace PostgreSQL with MongoDB
- create a second database
- modify production data manually
- delete tables or data without approval
- bypass Prisma unnecessarily

Preserve relational integrity and foreign-key relationships.

Do not change the database schema without considering existing data, relationships, migrations, and affected features.

---

## 8. Code Modification Rules

Before modifying code:

1. Read the relevant documentation.
2. Inspect the existing implementation.
3. Understand the existing dependencies.
4. Identify which files need modification.
5. Explain the planned changes.
6. Then implement.

Prefer the smallest change that correctly solves the task.

Do not rewrite working code unnecessarily.

Do not modify unrelated modules.

Do not redesign the architecture while implementing a feature.

Do not delete working functionality unless explicitly instructed.

---

## 9. Feature Isolation

Work on one feature at a time.

Examples:

- Authentication
- Employee Management
- Attendance
- Leave
- Payroll
- Notifications

Do not mix unrelated feature implementations in one task.

If implementing Attendance:

Do not simultaneously redesign Payroll, Leave, or Authentication.

Keep changes focused and reviewable.

---

## 10. Git Rules

Never work directly on `main` for feature development.

Use feature branches such as:

```text
feature/auth
feature/employees
feature/attendance
feature/leave
feature/payroll
Do not force-push shared branches unless explicitly coordinated with the team.

Do not commit:

.env
passwords
API keys
JWT secrets
private credentials
node_modules
11. Testing and Verification

After meaningful implementation:

Run TypeScript/type checking.
Run linting if configured.
Run relevant tests.
Build the affected application.
Fix errors caused by your changes.

Do not claim a feature is complete if it has not been verified.

When reporting completion, state:

What was implemented
Files changed
Tests/checks performed
Any remaining issues

If a check cannot be run, explicitly state why.

12. Progress Tracking

After completing a feature, update:

docs/PROGRESS.md

Record:

completed functionality
current work
remaining work
known issues
important implementation decisions

Do not mark something complete if it has not actually been implemented and verified.

13. AI Agent Behavior

You are an implementation assistant, not the project architect.

Do not make major architectural decisions silently.

Do not add technologies because they are popular or because you personally prefer them.

Do not over-engineer the application.

Prefer:

simple
clear
maintainable
hackathon-friendly

over:

complex
over-engineered
unnecessary abstractions

When multiple reasonable solutions exist, prefer the simplest solution consistent with the architecture.

14. Context Efficiency

Do not repeatedly request or reproduce the entire project.

Read only the relevant files needed for the current task.

Before starting a feature, inspect:

CLAUDE.md
docs/SRS.md
docs/ARCHITECTURE.md
docs/TECH_STACK.md
docs/PROGRESS.md

Then inspect only the relevant existing source files.

Do not unnecessarily inspect or modify unrelated parts of the repository.

Do not ask the developer to repeatedly provide information already present in the repository.

15. Collaboration

Multiple developers and AI agents may work on this repository.

Assume another developer may be working on another feature.

Therefore:

Avoid unnecessary changes to shared files.
Do not overwrite unrelated work.
Keep changes focused.
Do not modify another feature's implementation unless required.
Clearly report dependencies on another feature.
Do not assume another branch's work exists until it has been merged or is otherwise available.
Do not reset or discard another developer's changes.

GitHub is the source of truth for shared project code.

16. Shared Files

Be especially careful when modifying:

package.json
package-lock.json
prisma/schema.prisma
server/src/app.ts
server/src/server.ts
client/src/App.tsx
routing files
shared configuration

Before modifying a shared file:

Inspect its current contents.
Determine whether the change is actually required.
Preserve existing functionality.
Avoid unrelated formatting or refactoring.
17. API Rules

Use REST APIs according to docs/ARCHITECTURE.md.

Use the /api prefix.

Use consistent HTTP status codes.

Use the project's standard response format.

Do not create duplicate endpoints that perform the same operation.

Do not change an existing API contract without checking which frontend or backend modules depend on it.

When an API contract must change, update the affected client code and documentation.

18. Authorization Rules

Authorization must be enforced on the backend.

For every protected endpoint, determine:

Is the user authenticated?
What role does the authenticated user have?
Is the user allowed to perform this operation?
Is the requested resource owned by or accessible to that user?

Never authorize a request solely because the frontend says the user has permission.

Never accept a privileged role from the request body as the source of truth.

Never allow an employee to access another employee's protected information simply by changing an ID in the URL or request body.

19. Validation Rules

Validate user-controlled input on the backend.

Use Zod schemas for relevant:

authentication inputs
profile updates
employee management
attendance operations
leave requests
payroll updates

Do not rely only on frontend validation.

Validate:

required fields
formats
allowed values
lengths
dates
business constraints where appropriate
20. Error Handling

Use centralized backend error handling.

Do not expose:

database stack traces
internal file paths
secrets
passwords
sensitive implementation details

Return useful but safe error messages to the client.

Log detailed technical information only on the server when appropriate.

21. Database Transactions

Use Prisma transactions when multiple database operations must succeed or fail together.

Examples include:

employee creation involving multiple related records
leave approval involving multiple updates
other multi-record business operations

Do not use transactions unnecessarily for simple single-record operations.

22. Frontend Rules

Keep React components focused on presentation and user interaction.

Do not put large amounts of business logic directly inside components.

Keep API communication in appropriate service functions.

Use React Router for navigation.

Use Tailwind CSS for styling.

Reuse existing components and styles before creating duplicates.

Do not redesign the entire UI while implementing a backend feature.

23. UI Consistency

Maintain a consistent Dayflow design system.

Before creating a new UI component:

Check whether an existing component can be reused.
Follow the existing spacing, typography, layout, and interaction patterns.
Avoid creating duplicate components with slightly different behavior.

Do not add a component library without approval.

24. Environment Variables

Never hardcode secrets.

Use environment variables.

Examples:

DATABASE_URL
JWT_SECRET
CLIENT_URL
SERVER_URL

Keep:

.env

out of Git.

Maintain:

.env.example

with variable names but without real secrets.

Never expose server-only secrets through frontend environment variables.

25. Implementation Order

The recommended implementation order is:

1. Project setup
2. Database + Prisma
3. Authentication + RBAC
4. Employee management
5. Dashboards
6. Attendance
7. Leave management
8. Payroll
9. Optional notifications
10. Testing
11. Deployment
12. UI polish

Do not skip foundational dependencies without a clear reason.

Do not begin optional features before the core SRS functionality works.

26. MVP Priority

The primary goal is a working, secure HRMS that satisfies the SRS.

Prioritize:

Authentication
Authorization
Employee management
Attendance
Leave management
Leave approval
Payroll visibility
Dashboards

Optional enhancements come later.

A smaller secure and functional application is preferable to a larger incomplete application.

27. Requirement Discipline

When implementing a feature, distinguish between:

Required by SRS

Must be implemented.

Architecture requirement

Must be implemented according to the architecture.

Optional enhancement

Should not block the MVP.

Do not turn optional features into mandatory scope.

Do not invent complex functionality that the SRS does not require.

28. Handling Ambiguity

If the SRS, architecture, or existing code does not clearly specify something:

Identify the ambiguity.
Explain the possible interpretations.
Recommend the simplest reasonable option.
Ask for approval if the decision materially affects architecture, database schema, security, or product behavior.

Do not silently make major decisions.

29. Before Starting a Feature

Before writing code, provide:

Understanding

Briefly explain what the feature needs to accomplish.

Files

List the files you expect to create or modify.

Dependencies

Explain which existing modules the feature depends on.

Implementation plan

Give a short ordered plan.

Then implement only the approved/current task.

30. After Completing a Feature

Provide:

Implemented

List the functionality completed.

Files changed

List files created or modified.

Verification

List:

typecheck
lint
tests
build
manual verification
Remaining issues

List anything unresolved.

Progress

Update:

docs/PROGRESS.md

31. Important Rule

Before implementing any feature, ask:

What does the SRS require?

What does the architecture specify?

What does the existing code already provide?

What is the smallest correct implementation?

Then implement only what is necessary.

32. Completion Standard

A feature is complete only when:

It follows the SRS.
It follows the architecture.
It uses the approved technology stack.
Authorization is correctly enforced.
Input is validated.
Existing functionality is not unnecessarily broken.
Relevant checks/tests pass.
docs/PROGRESS.md is updated.