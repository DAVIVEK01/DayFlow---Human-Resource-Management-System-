# Dayflow — Software Architecture Specification

## 1. Purpose

This document defines the implementation architecture for Dayflow HRMS.

**Architecture:** Modular monolith  
**Frontend:** React + Vite + React Router + Tailwind CSS + TypeScript  
**Backend:** Node.js + Express + TypeScript  
**Database:** PostgreSQL + Prisma  
**Authentication:** JWT + HttpOnly cookies + bcrypt  
**Validation:** Zod  
**API:** REST + Fetch API

The SRS is the source of truth for product requirements. This document defines how those requirements should be implemented.

---

## 2. High-Level Architecture

```text
                    DAYFLOW HRMS

             ┌──────────────────────┐
             │      Browser         │
             │ React + Vite         │
             │ React Router         │
             │ Tailwind CSS         │
             └──────────┬───────────┘
                        │ HTTP/JSON
                        ▼
             ┌──────────────────────┐
             │      Node.js         │
             │       Express        │
             │                      │
             │ Authentication       │
             │ Authorization/RBAC   │
             │ Validation           │
             │ REST API             │
             │ Business Logic       │
             └──────────┬───────────┘
                        │
                      Prisma
                        │
                        ▼
             ┌──────────────────────┐
             │     PostgreSQL       │
             │ Users                │
             │ Employees            │
             │ Attendance           │
             │ Leave                │
             │ Payroll              │
             │ Notifications        │
             └──────────────────────┘
```

Use a modular monolith. Do not use microservices for the hackathon.

---

## 3. Repository Structure

```text
dayflow/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   ├── leave/
│   │   │   └── payroll/
│   │   ├── hooks/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── employees/
│   │   │   ├── attendance/
│   │   │   ├── leave/
│   │   │   ├── payroll/
│   │   │   └── notifications/
│   │   ├── db/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
│
├── docs/
│   ├── SRS.md
│   ├── ARCHITECTURE.md
│   └── TECH_STACK.md
│
├── CLAUDE.md
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

---

## 4. Backend Structure

Every backend feature follows the same pattern:

```text
module/
├── controller.ts
├── service.ts
├── routes.ts
├── validation.ts
└── types.ts
```

Request flow:

```text
HTTP Request
    ↓
Express
    ↓
Authentication middleware
    ↓
Authorization/RBAC middleware
    ↓
Zod validation
    ↓
Controller
    ↓
Service / business logic
    ↓
Prisma
    ↓
PostgreSQL
```

**Controllers:** request/response handling only.

**Services:** business rules and workflows.

**Routes:** endpoint definitions and middleware.

---

## 5. Authentication

Required capabilities:

- Registration
- Login
- Logout
- Email verification
- Authenticated session
- `/api/auth/me`
- Role-based authorization

Flow:

```text
Register
  ↓
Validate
  ↓
Check uniqueness
  ↓
Hash password with bcrypt
  ↓
Create user/employee
  ↓
Email verification
```

Login:

```text
Login
  ↓
Validate credentials
  ↓
Check verification
  ↓
Create JWT
  ↓
Set HttpOnly cookie
```

Rules:

- Never store plaintext passwords.
- Never store authentication tokens in localStorage.
- Never expose password hashes.
- JWT secret stays server-side.
- Use Secure cookies in production.

---

## 6. RBAC

Roles:

```text
EMPLOYEE
ADMIN
```

Use server-side middleware such as:

```text
requireAuth()
requireRole("ADMIN")
```

Permission summary:

| Capability | Employee | Admin |
|---|---:|---:|
| View own profile | ✓ | ✓ |
| Edit permitted own fields | ✓ | ✓ |
| Edit all employee information | ✗ | ✓ |
| View own attendance | ✓ | ✓ |
| View all attendance | ✗ | ✓ |
| Apply for leave | ✓ | ✓ |
| Approve/reject leave | ✗ | ✓ |
| View own salary | ✓ | ✓ |
| View all salary information | ✗ | ✓ |
| Update salary structure | ✗ | ✓ |
| Manage employees | ✗ | ✓ |

Never trust role/user IDs supplied by the frontend.

---

## 7. Database

Use PostgreSQL with Prisma.

Core entities:

```text
User
Employee
Attendance
LeaveType
LeaveRequest
SalaryStructure
Document
Notification
EmailVerificationToken
```

Important relationships:

```text
User 1 ───── 1 Employee
Employee 1 ───── N Attendance
Employee 1 ───── N LeaveRequest
LeaveType 1 ───── N LeaveRequest
Employee 1 ───── 1 SalaryStructure
Employee 1 ───── N Document
User 1 ───── N Notification
User 1 ───── N EmailVerificationToken
```

Important constraints:

```text
User.email UNIQUE
User.employeeId UNIQUE
Attendance(employeeId, date) UNIQUE
```

Use foreign keys and Prisma migrations.

---

## 8. Core API

Base URL:

```text
/api
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/verify-email
POST /api/auth/resend-verification
```

### Employees

```text
GET   /api/employees/me
PATCH /api/employees/me
GET   /api/employees
GET   /api/employees/:id
PATCH /api/employees/:id
```

### Attendance

```text
POST /api/attendance/check-in
POST /api/attendance/check-out
GET  /api/attendance/me
GET  /api/attendance
```

### Leave

```text
POST  /api/leaves
GET   /api/leaves/me
GET   /api/leaves
GET   /api/leaves/:id
PATCH /api/leaves/:id/approve
PATCH /api/leaves/:id/reject
```

### Payroll

```text
GET   /api/payroll/me
GET   /api/payroll
GET   /api/payroll/:employeeId
PATCH /api/payroll/:employeeId
```

### Notifications

```text
GET   /api/notifications
PATCH /api/notifications/:id/read
```

---

## 9. Attendance

Workflow:

```text
Employee
   ↓
Check-in
   ↓
Attendance created
   ↓
Check-out
   ↓
checkOut stored
```

Rules:

1. One record per employee per date.
2. Prevent duplicate check-in.
3. Prevent check-out without check-in.
4. Employees access only their own records.
5. Admin can access all records.

Statuses:

```text
PRESENT
ABSENT
HALF_DAY
LEAVE
```

---

## 10. Leave

Workflow:

```text
Employee
    ↓
Apply
    ↓
PENDING
   /   /   APPROVED REJECTED
```

Rules:

1. New requests start as PENDING.
2. Only ADMIN can approve/reject.
3. Employee cannot approve their own request.
4. Invalid status transitions must be rejected.
5. Multi-step approval operations should use a database transaction.

---

## 11. Employee Profiles

Employee self-service may edit permitted fields such as:

```text
phone
address
profile picture
```

Admin may edit all employee information.

Use separate validation models for:

```text
UpdateOwnProfileInput
AdminUpdateEmployeeInput
```

Do not allow normal employee profile endpoints to modify:

```text
role
salary
employee ID
privileged status
```

---

## 12. Payroll

MVP scope:

```text
Employee
    ↓
View own salary information

Admin
    ↓
View salary information
    ↓
Update salary structure
```

Do not implement full statutory payroll, tax calculation, payment processing, or banking integration unless the SRS is explicitly expanded.

---

## 13. Frontend

Routes:

```text
/login
/register
/verify-email

/employee/dashboard
/employee/profile
/employee/attendance
/employee/leave
/employee/payroll

/admin/dashboard
/admin/employees
/admin/employees/:id
/admin/attendance
/admin/leave
/admin/payroll
```

Use React state and simple service functions using `fetch`.

Do not add a large global state-management library for the MVP.

Frontend route guards are for UX only. Backend authorization is mandatory.

---

## 14. Validation

Use Zod for important forms and API inputs.

Validate at both boundaries:

```text
Frontend
    ↓
User-friendly validation

Backend
    ↓
Security/business validation
```

The backend is the final authority.

---

## 15. API Response Convention

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data"
  }
}
```

Use appropriate HTTP status codes including:

```text
200
201
400
401
403
404
409
422
500
```

---

## 16. Security

Minimum requirements:

- bcrypt password hashing
- JWT authentication
- HttpOnly cookies
- HTTPS in production
- Server-side RBAC
- Zod backend validation
- Restricted CORS
- Security headers
- No secrets in Git
- No passwords/tokens in logs

Environment variables:

```text
DATABASE_URL
JWT_SECRET
CLIENT_URL
SERVER_URL
```

Only add environment variables for optional services if those services are actually implemented.

---

## 17. Error Handling

Use one global Express error middleware:

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Error
 ↓
Global error handler
 ↓
JSON response
```

Never expose database stack traces to the client.

---

## 18. Transactions

Use Prisma transactions when an operation changes multiple related records.

Example:

```text
Leave approval
    ↓
Update leave request
    ↓
Create notification if implemented
    ↓
Commit
```

If a required operation fails, roll back.

---

## 19. Testing

Prioritize tests for:

1. Registration
2. Login
3. Authentication
4. RBAC
5. Employee data authorization
6. Duplicate attendance prevention
7. Check-in/check-out rules
8. Leave application
9. Leave approval/rejection
10. Payroll authorization

Do not make a large testing framework part of the initial setup. Add the simplest suitable testing tooling when the testing phase begins.

---

## 20. Deployment

Simple target:

```text
GitHub
   │
   ├── Frontend → Vercel
   │
   └── Backend → Render
                    │
                    ▼
              Managed PostgreSQL
```

The deployment architecture should remain simple and should not require additional infrastructure.

---

## 21. AI Coding-Agent Rules

Claude and OpenCode/DeepSeek must:

1. Read `CLAUDE.md` before changing code.
2. Read `docs/SRS.md`.
3. Read `docs/ARCHITECTURE.md`.
4. Read `docs/TECH_STACK.md`.
5. Read `docs/PROGRESS.md`.
6. Inspect existing code before modifying it.
7. Follow this architecture.
8. Use only the finalized stack unless a new dependency is justified.
9. Keep backend authorization as the security boundary.
10. Keep business logic in services.
11. Keep controllers thin.
12. Validate backend inputs with Zod.
13. Use Prisma for database access.
14. Do not introduce microservices.
15. Do not replace PostgreSQL, Express, or React without explicit approval.
16. Do not modify unrelated modules.
17. Do not delete working functionality without approval.
18. Make small, reviewable changes.
19. Run available checks after meaningful changes.
20. Update `docs/PROGRESS.md` after completing a feature.
21. If a requirement is ambiguous, flag it rather than inventing behavior.
22. Never expose secrets or credentials.

---

## 22. Implementation Order

```text
1. Project setup
        ↓
2. Database + Prisma
        ↓
3. Authentication + RBAC
        ↓
4. Employee management
        ↓
5. Dashboards
        ↓
6. Attendance
        ↓
7. Leave management
        ↓
8. Payroll
        ↓
9. Optional notifications
        ↓
10. Testing
        ↓
11. Deployment
        ↓
12. UI polish
```

Do not start optional features before the core SRS functionality works.

---

## 23. Definition of Done

The MVP is ready when:

- Employee can register.
- Employee can verify email.
- Employee can log in.
- Admin can log in.
- Correct role-specific dashboard appears.
- Employee can manage permitted profile fields.
- Admin can manage employees.
- Employee can check in/out.
- Employee can view attendance.
- Admin can view attendance.
- Employee can apply for leave.
- Admin can approve/reject leave.
- Employee can see leave status.
- Employee can view salary information.
- Admin can manage salary structure.
- Unauthorized API requests are rejected.
- Database migrations work.
- Production builds succeed.
- Complete Employee → Admin demo flow works.

---

## 24. Final Architecture Decision

```text
Frontend:
React + Vite + React Router + Tailwind CSS

Backend:
Node.js + Express

Language:
TypeScript

Database:
PostgreSQL + Prisma

Authentication:
JWT + HttpOnly Cookies + bcrypt

Validation:
Zod

API:
REST + Fetch API

Architecture:
Modular Monolith

Repository:
Git + GitHub
```

No additional technology should be introduced without a concrete requirement and explicit team agreement.
