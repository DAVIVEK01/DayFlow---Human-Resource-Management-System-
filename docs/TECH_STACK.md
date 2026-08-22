Dayflow — Technology Stack

## Frontend

- React
- Vite
- React Router
- Tailwind CSS

## Backend

- Node.js
- Express
- TypeScript

## Database

- PostgreSQL
- Prisma

## Authentication

- JWT
- bcrypt

## Validation

- Zod

## API Communication

- Browser Fetch API

## Development

- Git
- GitHub
- ESLint
- Prettier

## Architecture

React
  ↓
REST API
  ↓
Node.js + Express
  ↓
Prisma
  ↓
PostgreSQL

## Dependency Rule

Do not introduce additional libraries or frameworks unless a concrete
requirement cannot reasonably be implemented using the existing stack.

Any proposed new dependency must be justified before implementation.

The application must remain a modular monolith.

Do not introduce:
- Microservices
- GraphQL
- Redis
- Kafka
- Multiple databases
- Redux
- Firebase/Supabase authentication
- Unnecessary UI/component libraries
