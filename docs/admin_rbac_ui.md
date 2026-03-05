# Admin RBAC UI – Multi-Tenant Evolution Plan

This document serves as the implementation guide for the `admin_frontend`. It defines how to manage Users, Organizations, and Roles according to the Multi-Tenant schema.

> **Source of truth:**  
> - Backend admin/RBAC endpoints: Swagger at `/api/docs` (`/api/admin/*` and `/api/orgs/*` sections).  
> - This document focuses on how the Admin UI composes those endpoints into screens and flows, and may include roadmap UI ideas that go beyond the current implementation.

## 1. Context & Scope
The Admin UI must allow Super-Admins to manage the link between Users and Organizations. Unlike global roles, permissions here are context-aware based on the `Member` table.

## 2. Targeted API Endpoints (Internal Gateway)
The `admin_frontend` communicates with the backend using the following proxy-ready routes (all under `/api/admin`, guarded by `x-admin-secret` through `adminAuth`):

### 2.1 Organization Management  (**implemented today**)
These endpoints are implemented in `backend/src/routes/admin.ts`:

* `GET /api/admin/organizations` – List all tenants with pagination.
* `POST /api/admin/organizations` – Create a new tenant.
* `PATCH /api/admin/organizations/:orgId` – Update organization name / external reference.

### 2.2 Member & Role Management (Contextual)  (**implemented today**)
Organization membership (tenant roles based on the `Member` table):

* `GET /api/admin/organizations/:orgId/members` – List users in a specific organization with their roles (`MemberRole`).
* `POST /api/admin/organizations/:orgId/members` – Invite/Add a user to an organization with a specific role (`OWNER`, `ADMIN`, `MANAGER`, `VIEWER`).
* `PATCH /api/admin/organizations/:orgId/members/:userId` – Update a user's role within that specific organization.
* `DELETE /api/admin/organizations/:orgId/members/:userId` – Remove a user from an organization.

Global endpoint-level RBAC (gateway roles based on `Role`/`UserRole`/`RoleEndpointMapping` in `backend/src/routes/roles.ts`):

* `GET /api/admin/roles` – List roles with their endpoint mappings.
* `POST /api/admin/roles` – Create a new global role.
* `DELETE /api/admin/roles/:id` – Delete a global role.
* `GET /api/admin/roles/:id/endpoints` – List endpoint mappings for a role.
* `POST /api/admin/roles/:id/endpoints` – Add an endpoint mapping to a role.
* `DELETE /api/admin/roles/:id/endpoints/:mappingId` – Remove an endpoint mapping.
* `GET /api/admin/users` – List users with their global roles.
* `POST /api/admin/users/:id/roles` – Assign a global role to a user.
* `DELETE /api/admin/users/:id/roles/:roleId` – Remove a global role from a user.

### 2.3 System Audit & Settings  (**implemented today**)
System settings and audit logs (in `backend/src/routes/admin.ts`):

* `GET /api/admin/settings` – List all system settings.
* `PATCH /api/admin/settings/:key` – Update a specific system setting (e.g., toggle auth providers).
* `GET /api/admin/database` – Database inspector (table counts or specific table contents, with sensitive fields redacted).
* `GET /api/admin/logs` – Global audit log viewer with optional `organizationId` filter and `limit` parameter.

## 3. UI Structure (React Composition)

### Tab 1: Organizations Dashboard
* **View**: A data table showing all organizations.
* **Actions**: Click on an organization to manage its specific members and settings.

### Tab 2: User Roles (Member Manager)
* **View**: A split-screen layout.
  * **Left**: List of Organizations.
  * **Right**: Data table of Users belonging to the selected Organization.
* **Role Selector**: A dropdown within the table to change roles (Owner, Admin, Manager, Viewer).

### Tab 3: Security Logs
* **View**: A high-density table showing `AuditLog` entries.
* **Features**: Search by `userId` or `action` (e.g., `PROXY_API_CALL`), and filter by `organizationId` using the `GET /api/admin/logs` query params.

## 4. Implementation Guidelines
* **State Management**: Use a centralized `AdminProvider` to handle API calls using the `x-admin-secret` header.
* **Pagination**: Every table must support `page` and `limit` parameters as per the backend spec.
* **Security**: UI components must remain hidden or disabled if the authenticated user does not have the `OWNER` or `ADMIN` role in the selected context.