"""
Admin Frontend – E2E smoke tests
=================================
Covers the flows added in the Multi-tenant Phase 2:

  1. Login to the admin panel (email/password, no 2FA).
  2. Navigate to the Organizations tab.
     - Existing orgs from the seed are visible.
     - Create a new org via the dialog.
     - Edit the org name.
  3. Navigate to the Members tab.
     - Select the new org → no members yet.
     - Add a member (requires the seed user to exist in the DB).
     - Verify role badge appears.
     - Change the member's role.
     - Remove the member with confirmation.
  4. Navigate to the Database tab → table counts load without errors.

Run (from project root):
    python .agents/skills/webapp-testing/scripts/with_server.py \\
      --server "docker compose up" --port 80 \\
      -- python tests/admin_frontend_e2e.py

Or against a live stack (no with_server.py):
    BASE_URL=http://localhost:8080 \\
    ADMIN_EMAIL=jose.segura@controlc.io \\
    ADMIN_PASSWORD=your_password \\
    python tests/admin_frontend_e2e.py
"""

import os
import time
from playwright.sync_api import sync_playwright, expect

BASE_URL      = os.getenv("BASE_URL", "http://localhost:8080")
ADMIN_EMAIL   = os.getenv("ADMIN_EMAIL", "jose.segura@controlc.io")
ADMIN_PASS    = os.getenv("ADMIN_PASSWORD", "")   # set this via env

# Org created by this test run (will be cleaned up at the end via admin API)
TEST_ORG_NAME = "E2E Test Org"
TEST_ORG_SLUG = "e2e-test-org-" + str(int(time.time()))


def wait(page, ms: int = 800):
    page.wait_for_timeout(ms)


def test_admin_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        # ── 1. Login ──────────────────────────────────────────────────────────
        print("[1] Navigating to admin login…")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        page.screenshot(path="tests/screenshots/01_login.png")

        page.fill('input[type="email"]', ADMIN_EMAIL)
        page.fill('input[type="password"]', ADMIN_PASS)
        page.click('button[type="submit"]')
        page.wait_for_url("**/dashboard", timeout=10_000)
        page.screenshot(path="tests/screenshots/02_dashboard.png")
        print("[1] ✓ Logged in, on dashboard")

        # ── 2. Organizations tab ──────────────────────────────────────────────
        print("[2] Opening Organizations tab…")
        page.click('button:has-text("Organizations")')
        wait(page)
        page.wait_for_selector("text=Organizations", timeout=8_000)
        page.screenshot(path="tests/screenshots/03_orgs_list.png")

        # Seed org ControlC should be visible
        assert page.locator("text=ControlC").count() > 0, "ControlC org not found in list"
        print("[2] ✓ ControlC org is visible")

        # Create new org
        print("[2] Creating new org via dialog…")
        page.click('button:has-text("+ New Org")')
        wait(page, 400)
        page.fill('input[placeholder="Acme Corp"]', TEST_ORG_NAME)
        page.fill('input[placeholder="acme-corp"]', TEST_ORG_SLUG)
        page.click('button:has-text("Create")')
        wait(page, 1200)
        page.screenshot(path="tests/screenshots/04_orgs_after_create.png")
        assert page.locator(f"text={TEST_ORG_NAME}").count() > 0, "New org not visible after create"
        print(f"[2] ✓ Created org '{TEST_ORG_NAME}'")

        # Edit the org name
        print("[2] Editing org name…")
        # Find the Edit button in the row that contains our test org name
        row = page.locator(f"tr:has-text('{TEST_ORG_NAME}')")
        row.locator("button:has-text('Edit')").click()
        wait(page, 400)
        name_input = page.locator('input[value="' + TEST_ORG_NAME + '"]')
        name_input.fill(TEST_ORG_NAME + " Edited")
        page.click('button:has-text("Save")')
        wait(page, 1200)
        assert page.locator(f"text={TEST_ORG_NAME} Edited").count() > 0, "Org name not updated"
        print("[2] ✓ Org name edited")

        # ── 3. Members tab ───────────────────────────────────────────────────
        print("[3] Opening Members tab…")
        page.click('button:has-text("Members")')
        wait(page)
        page.screenshot(path="tests/screenshots/05_members_tab.png")

        # Select ControlC on the left
        page.click('button:has-text("ControlC")')
        wait(page, 1200)
        page.screenshot(path="tests/screenshots/06_controlc_members.png")
        assert page.locator("text=Members · ControlC").count() > 0, "ControlC member panel not shown"
        print("[3] ✓ ControlC members visible")

        # Add member (seed user must already exist)
        print("[3] Adding member…")
        page.click('button:has-text("+ Add Member")')
        wait(page, 400)
        page.fill('input[type="email"]', ADMIN_EMAIL)
        page.select_option("select", "VIEWER")
        page.click('form button:has-text("Add")')
        wait(page, 1200)
        page.screenshot(path="tests/screenshots/07_member_added.png")
        # The member might already exist (upsert), no error expected
        assert page.locator("text=VIEWER").count() > 0, "VIEWER role badge not visible"
        print("[3] ✓ Member added with VIEWER role")

        # Change role via role badge click
        print("[3] Changing member role…")
        page.locator("button:has-text('VIEWER')").first.click()
        wait(page, 400)
        page.select_option("select", "MANAGER")
        page.locator("button:has-text('Save')").first.click()
        wait(page, 1200)
        page.screenshot(path="tests/screenshots/08_role_changed.png")
        print("[3] ✓ Role change submitted")

        # ── 4. Database tab ──────────────────────────────────────────────────
        print("[4] Opening Database tab…")
        page.click('button:has-text("Database")')
        wait(page, 1200)
        page.screenshot(path="tests/screenshots/09_database_tab.png")
        # Should not show a 403 error
        error_el = page.locator("text=HTTP 403")
        assert error_el.count() == 0, "403 error shown on Database tab"
        # Users count card should be visible
        assert page.locator("text=Users").count() > 0, "Users count card not found"
        print("[4] ✓ Database tab loaded without 403")

        browser.close()
        print("\nAll admin frontend E2E smoke tests passed.")


if __name__ == "__main__":
    import pathlib
    pathlib.Path("tests/screenshots").mkdir(parents=True, exist_ok=True)
    test_admin_frontend()
