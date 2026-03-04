# Multi-Tenant Architecture & Auth Specification

This document serves as the primary reference for the Database Schema, Authentication Flow, and Security Middleware. It follows the **Secure Gateway Pattern** (Option 1 Architecture).

## 1. Database Schema (Prisma)

The system uses a **Multi-tenant RBAC (Role-Based Access Control)** model. Roles are contextual and tied to the Organization, not the User.



### 1.1 User Table (Better Auth Default)
Core identity managed by Better Auth.
* `id`: String (Primary Key).
* `email`: String (Unique).
* `name`: String (Optional).
* `emailVerified`: Boolean.
* `image`: String (Optional).
* `createdAt`: DateTime.
* `updatedAt`: DateTime.

### 1.2 Organization Table
Represents isolated business entities (tenants).
* `id`: UUID (Primary Key).
* `name`: String (e.g., "Company A").
* `slug`: String (Unique, URL friendly).
* `externalReferenceId`: String (Optional, for internal API mapping).
* `createdAt`: DateTime.

### 1.3 Member Table (The Link / RBAC)
Defines the relationship and specific role of a User within an Organization.
* `id`: UUID (Primary Key).
* `userId`: String (Foreign Key -> User.id).
* `organizationId`: UUID (Foreign Key -> Organization.id).
* `role`: String (Enum: `OWNER`, `ADMIN`, `MANAGER`, `VIEWER`).
* `Unique Constraint`: `@@unique([userId, organizationId])`.

### 1.4 AuditLog Table (Security Monitoring)
Tracks sensitive actions and internal proxy calls.
* `id`: UUID (Primary Key).
* `action`: String (e.g., `PROXY_API_CALL`, `AUTH_TOGGLE`).
* `userId`: String (Foreign Key).
* `organizationId`: UUID (Foreign Key).
* `details`: JSON (Metadata like IP, payload, or response status).
* `timestamp`: DateTime.

### 1.5 SystemSettings Table (Admin Control)
Global feature flags for the Super Admin.
* `id`: UUID (Primary Key).
* `settingKey`: String (Unique).
* `isEnabled`: Boolean.
* `configValue`: JSON (Optional, stores API keys/secrets).

---

## 2. Security & Request Lifecycle

The Backend acts as a **Secure Gateway** between the DMZ and the Internal Infrastructure.



### 2.1 Deep Validation Middleware
Every request to a protected endpoint must pass through the `checkOrganizationAccess` middleware:
1. **Identity Verification**: Validate the JWT/Session via Better Auth.
2. **Context Extraction**: Get `organizationId` from the URL params or headers.
3. **Membership Check**: Query the `Member` table to ensure the `userId` belongs to the `organizationId`.
4. **Role Check**: Verify if the user's role meets the required permission level for the operation.

### 2.2 Internal Proxy Pattern
Once authorized, the Backend performs the request to the internal private API:
* **Input**: Organization ID and user intent.
* **Backend Action**: Executes a secure call (fetch/axios) to the internal URL.
* **Output**: Data is returned to the Frontend only after successful authorization and optional data sanitization.

---

## 3. Administrative Requirements

### 3.1 Pagination Pattern
All listing endpoints (Logs, Users, Settings) must implement standard pagination:
* `GET /api/orgs/:orgId/resource?page=1&limit=20`

### 3.2 2FA (Two-Factor Authentication)
* **Method**: Email based TOTP.
* **Provider**: SendGrid (Dedicated microservice).
* **Isolation**: All email secrets must remain in the Internal Network `.env`.