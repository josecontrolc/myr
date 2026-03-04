# Admin RBAC UI – Multi-Tenant Evolution Plan

This document serves as the implementation guide for the `admin_frontend`. It defines how to manage Users, Organizations, and Roles according to the Multi-Tenant schema.

## 1. Context & Scope
The Admin UI must allow Super-Admins to manage the link between Users and Organizations. Unlike global roles, permissions here are context-aware based on the `Member` table.

## 2. Targeted API Endpoints (Internal Gateway)
The `admin_frontend` will communicate with the backend using the following proxy-ready routes:

### Organization Management
* `GET /api/admin/organizations` – List all tenants with pagination.
* `POST /api/admin/organizations` – Create a new tenant.

### Member & Role Management (Contextual)
* `GET /api/admin/organizations/:orgId/members` – List users in a specific organization with their roles.
* `POST /api/admin/organizations/:orgId/members` – Invite/Add a user to an organization with a specific role (`ADMIN`, `MANAGER`, `VIEWER`).
* `PATCH /api/admin/organizations/:orgId/members/:userId` – Update a user's role within that specific organization.
* `DELETE /api/admin/organizations/:orgId/members/:userId` – Remove a user from an organization.

### System Audit & Settings
* `GET /api/admin/logs` – Global audit log viewer (Kibana-style) with filtering by `organizationId`.
* `PATCH /api/admin/settings/:key` – Toggle global auth providers (Google, Microsoft).

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
* **Features**: Search by `userId` or `action` (e.g., `PROXY_API_CALL`).

## 4. Implementation Guidelines
* **State Management**: Use a centralized `AdminProvider` to handle API calls using the `x-admin-secret` header.
* **Pagination**: Every table must support `page` and `limit` parameters as per the backend spec.
* **Security**: UI components must remain hidden or disabled if the authenticated user does not have the `OWNER` or `ADMIN` role in the selected context.