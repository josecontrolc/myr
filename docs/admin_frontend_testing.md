# Admin Frontend – Testing Strategy

This document describes how to smoke‑test the `admin_frontend` app using Playwright, following the `webapp-testing` skill.

## 1. Targets

- Admin app running at `http://localhost:8080` (via Docker/nginx) or `http://localhost:5174` in dev.
- Backend API running at `http://localhost:3000` (for local dev).

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

BASE_URL = "http://localhost:5174"

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

Extend this script with 2FA/email‑OTP flows if you have deterministic test users and test secrets configured.

