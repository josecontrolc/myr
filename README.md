# MyRTest - Secure DMZ Architecture

A secure multi tier application implementing network segmentation with separate DMZ and internal networks using Docker Compose.

## Architecture Overview

This project implements a secure DMZ (Demilitarized Zone) architecture with two isolated networks:

### DMZ Network (dmz_net)
* **NGINX Reverse Proxy**: Entry point, handles routing and SSL termination
* **React Frontend**: Serves the user interface

### Internal Network (internal_net)
* **Express Backend**: Handles business logic and database operations
* **PostgreSQL Database**: Stores user data and system settings

## Key Features

* **Network Isolation**: Frontend cannot directly access the database
* **Dynamic Authentication**: Better Auth with database driven provider configuration
* **Type Safety**: Full TypeScript support across frontend and backend
* **Modern Stack**: React + Vite, Express, Prisma ORM
* **Feature Flags**: SystemSettings model for runtime configuration

## Quick Start Guide

```bash
# 1. Start all services
docker-compose up --build -d

# 2. Wait 30 seconds for initialization

# 3. Initialize database schema (first time only)
cd backend
npx prisma db push
cd ..

# 4. Seed auth configuration (first time only)
docker exec backend_api npm run seed

# 5. Open browser
# Visit: http://localhost
# Click "Create Account" and register
```

## Common Commands

```bash
# View all users and sessions
docker exec backend_api npm run test:auth

# Open database GUI (Prisma Studio)
docker exec -it backend_api npx prisma studio
# Then visit: http://localhost:5555

# View logs
docker logs backend_api -f

# Restart a service
docker-compose restart backend

# Stop everything
docker-compose down

# Reset database (deletes all data)
docker-compose down -v && docker-compose up -d
```

## Local Development (Backend and Frontend on Your Machine)

Use this flow when you want to run the backend and frontend on your host (e.g. on Windows, to avoid Prisma engine issues when using Docker for the backend).

**Requirements:** Node.js 20+, PostgreSQL reachable at `localhost:5432` (you can run only the database with Docker).

### First Time Setup

1. **Start only the database** (from the project root):

   ```bash
   docker-compose up -d postgres
   ```

   (Or use a local PostgreSQL instance with user `postgres`, password `postgres`, database `myrtest`.)

2. **Backend: schema and seed data**

   ```bash
   cd backend
   npx prisma db push
   npm run seed
   ```

3. **Frontend:** no special first time steps required.

### Every Time You Start Everything

1. **Database:** if you use Docker only for Postgres:

   ```bash
   docker-compose up -d postgres
   ```

2. **Backend** (terminal 1):

   ```bash
   cd backend
   npm run dev
   ```

   It should be running at `http://localhost:3000`.

3. **Frontend** (terminal 2):

   ```bash
   cd frontend
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

4. **Use the app:** open **http://localhost:5173** in your browser.  
   Home, Login, Register, Dashboard, and **Admin** (http://localhost:5173/admin/dashboard) all talk to the backend on port 3000.

### Environment Variables

- **Backend:** `backend/.env` with `DATABASE_URL`, `ADMIN_SECRET`, etc. (already set up).
- **Frontend:** `frontend/.env` with `VITE_API_URL=http://localhost:3000` and `VITE_ADMIN_SECRET=test_admin_secret_123` for the Admin panel.

## Project Structure

```
myrtest/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server entry point
│   │   ├── lib/
│   │   │   └── auth.ts           # Better Auth configuration
│   │   └── scripts/
│   │       ├── seed.ts           # Seed auth settings
│   │       └── test-auth.ts      # Test users and sessions
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # React entry point
│   │   ├── App.tsx               # Routes
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # Auth state management
│   │   ├── components/
│   │   │   ├── LoginForm.tsx     # Login form
│   │   │   └── RegisterForm.tsx  # Register form
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Home page
│   │   │   ├── Login.tsx         # Login page
│   │   │   ├── Register.tsx      # Register page
│   │   │   └── Dashboard.tsx     # Protected dashboard
│   │   └── index.css             # Tailwind styles
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf                # Reverse proxy configuration
├── docker-compose.yml             # Multi container orchestration
├── .env                           # Environment variables (Docker)
└── README.md                      # This file
```

## Getting Started

### Prerequisites

* Docker and Docker Compose installed
* Node.js 20+ (optional, only for local development outside Docker)

### Quick Start (Recommended)

**Step 1: Configure Environment**

The `.env` file is already created with default values. For production, update:
* `BETTER_AUTH_SECRET`: Generate with `openssl rand -base64 32`

**Step 2: Start All Services**

From the project root:
```bash
# Build and start all containers
docker-compose up --build -d

# Wait about 30 seconds for services to initialize
```

**Step 3: Initialize Database Schema**

```bash
# Push the Prisma schema to the database
cd backend
npx prisma db push

# Seed authentication configuration
cd ..
docker exec backend_api npm run seed
```

**Step 4: Access the Application**

Open your browser and visit: **http://localhost**

You should see the home page with "Sign In" and "Create Account" buttons.

**Step 5: Create Your First User**

1. Click **"Create Account"**
2. Fill in the form (name, email, password min 8 chars)
3. Click **"Create Account"**
4. You will be automatically logged in and redirected to the Dashboard

Done! Your DMZ architecture with authentication is now running.

### Starting Services After First Setup

Once you've done the initial setup, you only need:

```bash
# Start everything
docker-compose up -d

# Or with rebuild if you changed code
docker-compose up --build -d
```

### Development with Local Node Modules

If you want to install dependencies locally (for IDE autocomplete, etc.):

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

Note: The containers use their own `node_modules` via Docker volumes, so local installation is optional and only for IDE support.

### Accessing the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application UI |
| **Backend API** | http://localhost/api | API endpoints |
| **Health Check** | http://localhost/api/health | Backend health status |
| **NGINX Health** | http://localhost/nginx-health | Proxy health status |
| **Prisma Studio** | http://localhost:5555 | Database GUI (after running command) |

### Docker Container Management

**View Running Containers:**
```bash
docker ps
```

**View Logs:**
```bash
# All services (follow mode)
docker-compose logs -f

# Specific service
docker logs backend_api -f
docker logs frontend_app -f
docker logs reverse_proxy -f
docker logs database -f

# Last 50 lines
docker logs backend_api --tail 50
```

**Stop Services:**
```bash
# Stop but keep data
docker-compose down

# Stop and remove all data (including database)
docker-compose down -v
```

**Restart Services:**
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx
```

**Rebuild After Code Changes:**
```bash
# Rebuild and restart specific service
docker-compose up -d --build backend

# Rebuild everything
docker-compose up --build -d
```

## Database Schema

### User Model
Compatible with Better Auth, includes fields for email, name, OAuth providers.

### SystemSettings Model
Feature flag system for dynamic authentication configuration:
* `settingKey`: Unique identifier (e.g., `auth_google_enabled`)
* `isEnabled`: Boolean flag to enable/disable features
* `providerConfig`: JSON field for additional configuration

## Security Features

* Network segmentation via Docker networks
* No direct database access from DMZ
* Security headers configured in NGINX
* Environment variable based configuration
* No hardcoded credentials

## Testing Authentication

### Initial Setup

After starting the application for the first time, seed the authentication configuration:

```bash
docker exec backend_api npm run seed
```

This creates the SystemSettings records for auth providers (email/password enabled, OAuth disabled by default).

### Creating Users via UI

1. Visit http://localhost
2. Click **Create Account**
3. Fill in the registration form:
   - Full Name: Your name
   - Email: your@email.com
   - Password: Min 8 characters
   - Confirm Password: Same as above
4. Click **Create Account**
5. You will be automatically logged in and redirected to the Dashboard

### Testing Authentication Flow

**Register a New User:**
```
Visit: http://localhost/register
Fill: Name, email, password
Result: Auto login and redirect to dashboard
```

**Login with Existing User:**
```
Visit: http://localhost/login
Fill: Email, password
Result: Redirect to dashboard
```

**Access Protected Dashboard:**
```
Visit: http://localhost/dashboard
If not logged in: Redirected to login
If logged in: See user information and status
```

**Logout:**
```
Click: Logout button on dashboard
Result: Session cleared, redirected to login
```

### Testing via Test Script

Check database state and active sessions:

```bash
docker exec backend_api npm run test:auth
```

This script shows:
- SystemSettings configuration
- All users in the database
- Active sessions

### Testing Auth Endpoints Directly

**Check Session (GET):**
```bash
curl -c cookies.txt http://localhost/api/auth/session
```

**Register (POST):**
```bash
curl -X POST http://localhost/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

**Login (POST):**
```bash
curl -X POST http://localhost/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

**Logout (POST):**
```bash
curl -X POST http://localhost/api/auth/sign-out \
  -b cookies.txt
```

### Database Inspection

**Important:** Use Prisma Studio from inside the Docker container to see the correct data:

```bash
docker exec -it backend_api npx prisma studio
```

This opens Prisma Studio at http://localhost:5555 connected to the Docker database.

Navigate to:
- `users` table: See all registered users
- `sessions` table: See active sessions
- `accounts` table: See authentication accounts
- `system_settings` table: See auth configuration

## Managing Users and Database

### View All Users

**Using the test script:**
```bash
docker exec backend_api npm run test:auth
```

Shows:
- All registered users with emails and names
- Active sessions
- Auth configuration settings

**Using SQL directly:**
```bash
docker exec database psql -U postgres -d myrtest -c "SELECT id, email, name FROM users;"
```

### View Active Sessions

```bash
docker exec backend_api npm run test:auth
```

Or with SQL:
```bash
docker exec database psql -U postgres -d myrtest -c "SELECT s.id, u.email, s.\"expiresAt\" FROM sessions s JOIN users u ON s.\"userId\" = u.id WHERE s.\"expiresAt\" > NOW();"
```

### Delete a Specific User

Using Prisma Studio (recommended):
```bash
docker exec -it backend_api npx prisma studio
```

Then navigate to the `users` table and delete the user visually.

**Or with SQL:**
```bash
# Replace email with the actual user email
docker exec database psql -U postgres -d myrtest -c "DELETE FROM users WHERE email = 'user@example.com';"
```

### Clear All Users and Sessions

```bash
docker exec database psql -U postgres -d myrtest -c "TRUNCATE users, accounts, sessions CASCADE;"
```

**Warning:** This deletes ALL users and sessions permanently.

### Reset Database to Fresh State

```bash
# Stop all services
docker-compose down -v

# Start services again
docker-compose up --build -d

# Wait 30 seconds, then reinitialize
cd backend
npx prisma db push
cd ..
docker exec backend_api npm run seed
```

### Access PostgreSQL Directly

```bash
# Open psql shell
docker exec -it database psql -U postgres -d myrtest

# Inside psql, you can run any SQL commands:
# \dt              - List all tables
# \d users         - Describe users table
# SELECT * FROM users;
# \q               - Exit
```

### Backup and Restore

**Create Backup:**
```bash
docker exec database pg_dump -U postgres myrtest > backup.sql
```

**Restore from Backup:**
```bash
cat backup.sql | docker exec -i database psql -U postgres -d myrtest
```

### Troubleshooting

**Issue: "Backend unavailable" on home page**
- Check: `docker logs backend_api`
- Fix: Ensure backend container is running

**Issue: Registration fails**
- Check: Password is at least 8 characters
- Check: Email is valid format
- Check: Email not already registered

**Issue: Login fails with correct credentials**
- Check: Better Auth is properly initialized
- Run: `docker exec backend_api npm run test:auth`
- Check: User exists in database

**Issue: Session not persisting**
- Check: Cookies are enabled in browser
- Check: CORS configuration allows credentials
- Check: `BETTER_AUTH_SECRET` is set in .env

**Issue: Redirect loop**
- Check: AuthContext is properly wrapping routes
- Check: Session endpoint returns valid data
- Clear browser cookies and try again

**Issue: Prisma Studio shows empty database**
- Make sure to run Prisma Studio from inside Docker: `docker exec -it backend_api npx prisma studio`
- The local Prisma Studio connects to a different database than the Docker one

**Issue: Cannot see users I created**
- Run: `docker exec backend_api npm run test:auth` to verify users exist
- Users are stored in the Docker PostgreSQL container, not locally

**Issue: Services fail to start**
- Check: `docker ps` to see which containers are running
- Check logs: `docker-compose logs`
- Try: `docker-compose down && docker-compose up --build -d`

## Production Deployment

### Security Checklist

Before deploying to production, update these configurations:

**1. Docker Compose (`docker-compose.yml`):**

Change the internal network to truly isolated:
```yaml
networks:
  internal_net:
    driver: bridge
    internal: true  # Change from false to true
```

Remove PostgreSQL port exposure:
```yaml
postgres:
  # Comment out or remove the ports section:
  # ports:
  #   - "5432:5432"
```

**2. Environment Variables (`.env`):**

Generate a strong secret:
```bash
openssl rand -base64 32
```

Update `.env`:
```
BETTER_AUTH_SECRET=<your-generated-secret>
BETTER_AUTH_URL=https://yourdomain.com
NODE_ENV=production
```

**3. NGINX Configuration:**

- Add SSL certificates
- Configure proper domain names
- Update CORS settings
- Add rate limiting
- Configure proper security headers

**4. Database:**

- Use strong PostgreSQL password
- Enable database backups
- Consider managed database service
- Set up monitoring

**5. Better Auth:**

- Configure email verification if needed
- Set up OAuth providers if needed
- Configure proper session timeouts
- Enable two factor authentication if needed

## Technologies

* **Frontend**: React 18, Vite, Tailwind CSS, TypeScript
* **Backend**: Node.js, Express, TypeScript, Prisma ORM
* **Database**: PostgreSQL
* **Auth**: Better Auth
* **Infrastructure**: Docker, Docker Compose, NGINX

## License

Private project
