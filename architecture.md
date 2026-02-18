# System Architecture: DMZ vs Internal

This document defines the network topology and service communication rules.

## Network Zones

### 1. DMZ Network (`dmz_net`)
* **Accessibility**: Publicly accessible via ports 80 and 443.
* **Services**:
    * `reverse_proxy` (NGINX): The entry point. Handles SSL termination and routing.
    * `frontend_app` (React): Serves static assets.
* **Rules**:
    * The Frontend container cannot talk to the Database container.
    * The Proxy forwards `/api` requests to the Backend container via the internal Docker DNS.

### 2. Internal Network (`internal_net`)
* **Accessibility**: Strictly private. No ports exposed to the host machine (except for debugging if explicitly allowed).
* **Services**:
    * `backend_api` (Express): Handles business logic and DB connections.
    * `database` (Postgres): Stores user data and system settings.
* **Rules**:
    * The Backend accepts traffic ONLY from the `reverse_proxy`.
    * The Database accepts traffic ONLY from the `backend_api`.

## Data Flow
1.  **User Request** reaches NGINX.
2.  **Static Content**: NGINX serves from `frontend_app`.
3.  **API Request**: NGINX proxies pass to `http://backend_api:3000`.
4.  **Backend** queries `database` via Prisma.
5.  **Response** flows back through NGINX to the user.