# Admin RBAC UI – Evolution Plan

This document explains how to evolve the placeholder `UserRolesTab` in `admin_frontend` into a full RBAC (roles and permissions) management UI, following `vercel-composition-patterns` and the backend capabilities.

## 1. Available endpoints (backend)

From the project `README`:

- `GET /api/admin/roles` – list roles.
- `POST /api/admin/roles` – create a role.
- `DELETE /api/admin/roles/:id` – delete a role.
- `GET /api/admin/roles/:id/endpoints` – list endpoints assigned to a role.
- `POST /api/admin/roles/:id/endpoints` – add role → endpoint mappings.
- `DELETE /api/admin/roles/:id/endpoints/:mappingId` – delete a mapping.
- `POST /api/admin/users/:id/roles` – assign a role to a user.
- `DELETE /api/admin/users/:id/roles/:roleId` – revoke a role from a user.

All these requests use the `x-admin-secret` header and sit behind JWT + RBAC middleware.

## 2. Recommended architecture (composition patterns)

### 2.1. RBAC context

Create a context with the following shape:

- `state`
  - `roles: Role[]`
  - `selectedRoleId: string | null`
  - `roleEndpoints: RoleEndpointMapping[]`
  - `searchUserQuery: string`
  - `userAssignments: UserWithRoles[]`
- `actions`
  - `loadRoles`, `createRole`, `deleteRole`
  - `loadRoleEndpoints`, `addEndpointMapping`, `removeEndpointMapping`
  - `loadUserAssignments`, `assignRoleToUser`, `revokeRoleFromUser`
  - `setSelectedRole`, `setSearchUserQuery`
- `meta`
  - flags for `loading`, `error`, editing ids, etc.

Suggested provider: `RbacProvider` in `admin_frontend/src/features/rbac/RbacProvider.tsx`. It should encapsulate all `fetch` logic using `VITE_API_URL` and `VITE_ADMIN_SECRET` and expose only the typed context interface to the UI.

### 2.2. UI compound components

Under `admin_frontend/src/features/rbac/`:

- `RbacLayout` – main grid for the **User Roles** tab (roles sidebar + right panel).
- `RolesList` – list of roles with:
  - counts for users and endpoints per role (read from `state`),
  - `Create` and `Delete` actions wired to `actions.createRole/deleteRole`.
- `RoleEndpointsTable` – editable table of endpoints for the selected role.
- `UserAssignmentsPanel` – user search plus list with checkboxes or chips to assign/revoke roles.

All these components should consume only the RBAC context (`useRbac()`), never call the backend directly.

## 3. Integration in `AdminDashboard`

1. Keep `UserRolesTab` as a thin container that:
   - wraps its content in `<RbacProvider>`.
   - composes `<RolesList />`, `<RoleEndpointsTable />` and `<UserAssignmentsPanel />`.
2. Replace the current placeholder data with real data from the context.
3. Keep a clear “beta area” notice while the feature set is incomplete, using a top-level `AdminCard` with an explicit `subtitle`.

## 4. State handling and UX

- **Loading states** – provide clear indicators for:
  - initial load of roles and endpoints,
  - create/delete role actions,
  - assigning/revoking roles.
- **Errors** – surface them as toasts or inline banners per action (for example, “Could not create role”), without blocking the whole page for a single failure.
- **Dangerous operations** – require confirmation before deleting roles or removing access to critical endpoints.

## 5. Security and consistency

- Reuse the same admin headers helper (`x-admin-secret`) and `API_BASE` as in `SettingsTab`, `LogsTab` and `DatabaseTab`.
- Keep end-user error messages generic; log detailed errors to the console or a future audit log.
- Align the RBAC UI with the existing design system:
  - use `AdminCard` for roles, endpoints and assignments sections,
  - use the theme tokens `primary/secondary`, `background/surface`, `textPrimary/textSecondary` for both light and dark mode.

## 6. Suggested phases

1. **Phase 1 – read-only**:
   - list real roles and their assigned endpoints,
   - show users and their roles without editing.
2. **Phase 2 – controlled editing**:
   - allow creating/deleting roles,
   - add/remove endpoint mappings,
   - assign/revoke roles for users.
3. **Phase 3 – UX refinement**:
   - add search/filtering by role and endpoint,
   - provide compact views and risk labels (for example mark endpoints as “admin-only”),
   - add RBAC-specific end-to-end tests (create role, assign, then verify access from the `main_frontend` app).

