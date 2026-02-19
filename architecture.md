# System Architecture: DMZ vs Internal

This document defines the network topology and service communication rules.

## Network Zones

### 1. DMZ Network (`dmz_net`)
* **Accessibility**: Publicly accessible via ports 80 and 443 (and 8080 for admin).
* **Services**:
    * `reverse_proxy` (NGINX): The entry point. Handles SSL termination and routing.
    * `main_frontend_app` (React/Vite): Main app for end users (port 80).
    * `admin_frontend_app` (React/Vite): Admin panel (port 8080).
* **Rules**:
    * Frontend containers cannot talk to the Database container.
    * The Proxy forwards `/api` to the Backend and serves each frontend by path/host.

### 2. Internal Network (`internal_net`)
* **Accessibility**: Strictly private. No ports exposed to the host machine (except for debugging if explicitly allowed).
* **Services**:
    * `backend_api` (Express): Business logic, auth, RBAC, DB access.
    * `database` (Postgres): Users, sessions, roles, system settings, audit logs.
    * `email_service`: Microservice that sends 2FA OTP emails via SendGrid.
* **Rules**:
    * The Backend accepts traffic ONLY from the `reverse_proxy`.
    * The Database accepts traffic ONLY from the `backend_api`.
    * The Backend calls `email_service` for OTP delivery.

## Data Flow
1.  **User Request** reaches NGINX.
2.  **Static Content**: NGINX serves from `main_frontend_app` or `admin_frontend_app`.
3.  **API Request**: NGINX proxies to `http://backend_api:3000`.
4.  **Backend** queries `database` via Prisma; may call `email_service` for 2FA.
5.  **Response** flows back through NGINX to the user.