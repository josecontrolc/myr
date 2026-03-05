# Admin Frontend – Testing Strategy

This document describes how to smoke‑test the `admin_frontend` app using Playwright, following the `webapp-testing` skill.

> **Source of truth:**  
> - API contract: Swagger at `/api/docs`.  
> - This guide focuses on end‑to‑end flows (login, tabs, admin actions) and may suggest extra test flows (like email‑OTP) that are optional or future enhancements.

## 1. Targets

- Admin app running at:
  - `http://localhost:8080` via Docker/nginx (recommended for end‑to‑end tests), or
  - `http://localhost:5174` in dev (`npm run dev` inside `admin_frontend`).
- Backend API:
  - `http://localhost:3000` when running `backend` directly with `npm run dev`, or
  - `http://localhost/api` when going through nginx in Docker (Swagger at `/api/docs`).

## 2. Recommended flows

- **Authentication**
  - Failed login: wrong password → generic error message, no redirect.
  - Successful login without 2FA/OTP → redirected to `/dashboard`.
  - Successful login requiring TOTP → redirected to `/auth/2fa-challenge`, then to `/dashboard` after valid code.
  - Successful login requiring email OTP → redirected to `/auth/email-otp`, then to `/dashboard` after valid code.
- **Protected routing**
  - Visiting `/dashboard` without a session redirects to `/login`.
  - After login, refreshing `/dashboard` keeps the session.
- **Tabs**
  - Switch between **Settings**, **Audit Logs**, **Database**, **User Roles** tabs.
  - Verify each tab renders without JS errors and basic content appears.
- **Admin actions**
  - Toggle an auth provider in **Settings** and confirm the label/visual state changes.
  - Use **Refresh** buttons in **Audit Logs** and **Database** without errors.

## 3. Running tests with `with_server.py`

From the project root:

```bash
python scripts/with_server.py \
  --server "cd backend && npm run dev" --port 3000 \
  --server "cd admin_frontend && npm run dev" --port 5174 \
  -- python tests/admin_frontend_e2e.py
```

The helper starts both servers, waits for them to be ready, then runs the Playwright script.

## 4. Skeleton Playwright script

```python
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5174"  # or "http://localhost:8080" when testing via Docker/nginx

def test_smoke_admin_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Login page
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")

        # Invalid login
        page.fill('input[type="email"]', "admin@example.com")
        page.fill('input[type="password"]', "wrong-password")
        page.click('button[type="submit"]')
        page.wait_for_timeout(500)

        # Valid login (seeded admin user)
        page.fill('input[type="password"]', "adminpassword")
        page.click('button[type="submit"]')

        # Dashboard and tabs
        page.wait_for_url("**/dashboard")
        page.click('button:has-text("Settings")')
        page.click('button:has-text("Audit Logs")')
        page.click('button:has-text("Database")')

        page.screenshot(path="admin_dashboard.png", full_page=True)
        browser.close()
```

Extend this script with 2FA flows if you have deterministic test users and test secrets configured:

- TOTP challenge flow (current implementation, `/auth/2fa-challenge`).
- Optional email‑OTP flow if/when it is implemented on top of the current TOTP baseline.

