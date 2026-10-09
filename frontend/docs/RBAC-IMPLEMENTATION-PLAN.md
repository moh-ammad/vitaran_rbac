# LMS RBAC implementation plan

## Current milestone

The frontend now has:

- Top navigation instead of a desktop sidebar.
- Permission-filtered navigation and route redirects.
- A settings prototype for roles, permissions, and users waiting for assignment.
- Auth form clearing after successful login/register.
- A safe default where a new account can see only the dashboard.

The role and permission values in `frontend/lib/rbac.ts` are temporary UI data. The backend must become the source of truth before this is production-ready.

## Recommended domain model

Use stable IDs and database relations. Do not encode permissions in React or JWT as the final authority.

- `User`: identity, password hash, account status, timestamps.
- `Role`: dynamic name, slug, description, system flag, timestamps.
- `Permission`: unique key such as `books.read`, `question-papers.create`, or `settings.roles.manage`.
- `RolePermission`: many-to-many join between roles and permissions.
- `UserRole`: many-to-many join so a user can have more than one role later.
- `Class`: school learning group such as Class 1.
- `Subject`: Mathematics, Science, and so on.
- `ClassSubject`: subjects available in a class.
- `TeacherAssignment`: user, class, and subject scope. This is what makes a Science teacher different from a Maths teacher without creating hardcoded role names.
- `StudentEnrollment`: user and class membership.
- `Resource`: common metadata for books, videos, and question papers, with resource type and owner.
- `ResourceClass`: limits a resource to one or more classes.
- `AuditLog`: records role, permission, assignment, and resource changes.

Prefer `User.status = PENDING | ACTIVE | SUSPENDED` over giving every new registration a powerful default role. A pending user may authenticate but should receive a restricted dashboard and no school data until a super admin assigns a role.

## Backend agent tasks

### 1. Schema and migration

Create the models above with Prisma relations and indexes. Seed only system permissions and the `super-admin` role. Keep ordinary roles database-created. Add unique constraints for permission keys, role slugs, class names, subject names, and assignment pairs.

Acceptance criteria:

- `npx prisma migrate dev` succeeds.
- `npx prisma db seed` is idempotent.
- A new registration is `PENDING` and has no active permissions except a restricted dashboard permission.

### 2. Authorization service

Implement one server-side authorization service:

- Load the authenticated user and active roles.
- Resolve effective permissions through `RolePermission`.
- Expose `requirePermission("settings.roles.manage")` middleware.
- Never trust a role or permission sent by the browser.
- Return `401` for missing/invalid tokens and `403` for insufficient permissions.

Add tests for missing token, expired token, pending user, allowed role, and forbidden role.

### 3. Dynamic role APIs

Add authenticated super-admin endpoints:

- `GET /roles`
- `POST /roles`
- `PATCH /roles/:id`
- `DELETE /roles/:id` for non-system roles only
- `GET /permissions`
- `PUT /roles/:id/permissions`
- `GET /users?status=pending`
- `PUT /users/:id/roles`
- `PUT /users/:id/status`

Validate names, slugs, permission keys, and assignment payloads with Zod. Use transactions when changing role permissions or user roles.

### 4. Auth contract

Return a stable auth response with:

- `user.id`
- `user.email`
- `user.name`
- `user.status`
- `user.roles[]` containing id, name, slug
- `permissions[]`
- `token`

Keep permissions in the response for navigation hints only. Every protected API endpoint must check permissions again on the server.

### 5. Classes, subjects, and teacher scope

Build endpoints for classes, subjects, class-subject links, student enrollment, and teacher assignments. A teacher query must always filter by the authenticated teacher's assignment. A student query must always filter by enrollment.

Examples:

- A Science teacher can read students and resources for assigned classes and Science only.
- A student in Class 1 can read Class 1 resources only.
- A super admin can read all classes, subjects, users, and resources.

### 6. Resource APIs

Create shared resource rules for books, videos, and question papers. Start with stale dashboard counts, then add CRUD endpoints. Every resource read must apply both permission checks and class scope filters.

### 7. Rate limiting and security

Add rate limits by IP and account identifier for login and registration. Add stricter limits for password failures. Configure CORS from an environment variable, use helmet-style security headers, validate request bodies, and never log passwords or tokens.

## Frontend agent tasks

### 8. Replace stale RBAC data

Replace `frontend/lib/rbac.ts` demo data with `GET /me` or auth response permissions. Store only the minimum session snapshot in localStorage. Use a loading state while permissions are resolved.

### 9. Settings roles UI

Connect the current settings prototype to role and permission APIs. Add:

- Role list with search.
- Create/edit role dialog.
- Permission groups by domain.
- Member count and assigned users.
- Pending users queue.
- Assign role, activate, suspend, and revoke actions.
- Confirmation dialogs for destructive changes.

Disable role editing for system roles where appropriate, but do not hardcode ordinary role names.

### 10. User and assignment screens

Add a user detail page with role assignment, account status, class enrollment, and teacher class-subject assignments. Hide controls the current user cannot perform.

### 11. Scoped dashboards

Make dashboard cards come from a permission-aware stats endpoint. The response should contain aggregate stats only, not nested records. The backend must compute the scope; the frontend must not filter an all-users payload.

- Super admin: global counts.
- Teacher: assigned class and subject counts.
- Student: enrolled class and available resource counts.
- Pending user: onboarding state and zero data counts.

### 12. UX and test coverage

Test these browser flows:

1. Super admin sees all allowed navigation and settings.
2. New user sees dashboard only.
3. Super admin creates a dynamic role.
4. Super admin grants permissions.
5. Super admin assigns that role to a pending user.
6. User refreshes and sees newly allowed navigation.
7. Teacher sees only assigned classes and subjects.
8. Student sees only enrolled-class resources.
9. Direct navigation to a forbidden page redirects safely.
10. Login, logout, and failed auth clear sensitive form state.

## Suggested agent sequence

1. Schema agent: Prisma models, migration, seed, schema tests.
2. Auth agent: status, roles, permissions response, authorization service.
3. Role API agent: roles, permissions, pending-user assignment endpoints.
4. Scope agent: classes, subjects, teacher assignments, enrollment filters.
5. Resource agent: books, videos, question papers with scope rules.
6. Security agent: rate limiting, headers, CORS, audit logging.
7. Frontend settings agent: connect this prototype to real APIs.
8. Frontend dashboard agent: scoped aggregate stats.
9. QA agent: API authorization tests and browser flows.

Each agent should report changed files, migration names, tests run, and any API contract changes before the next agent starts.
