# Dynamic Authentication Specification

We use the Better Auth library, but providers are enabled or disabled dynamically at runtime based on database records.

## Database Schema (Prisma)

### Model: `SystemSettings`
This table acts as a Feature Flag system for authentication providers.

* `id`: String (UUID, PK)
* `setting_key`: String (Unique). Example: `auth_google_enabled`
* `is_enabled`: Boolean (Default: false)
* `provider_config`: JSON (Optional). Stores Client ID or Tenant ID if not using Env Vars.
* `updated_at`: DateTime

### Model: `User`
Standard schema required by Better Auth.
* Includes fields for: `email`, `name`, `image`, `provider`, `providerAccountId`.

## Backend Logic Flow

1.  **Server Start**: The Express app initializes.
2.  **Config Load**: The app queries `SystemSettings` for keys starting with `auth_`.
3.  **Auth Initialization**:
    * The Better Auth instance is created.
    * The `socialProviders` object is constructed dynamically.
    * If `auth_google_enabled` is `false` in the DB, the Google provider is omitted from the configuration object.
4.  **Runtime Check**: Ideally, implement a middleware that rechecks these flags periodically or on every auth attempt to allow "Hot Swapping" without restarting the server.