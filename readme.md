# Team Access Control API

A backend system that demonstrates authentication, authorization (RBAC), team/organization management, invitations, session tracking, and audit logging — the core infrastructure behind any real SaaS product (like Slack, Notion, or GitHub Organizations).

This is a **backend-only** project — no frontend UI. All endpoints are tested via Postman and documented via Swagger.

---

## Why this project

Most beginner projects stop at login/signup. This one goes further — it proves the ability to design a system where **multiple users, organized into teams, have different permission levels**, with a full audit trail of sensitive actions. This mirrors the exact "IAM" (Identity and Access Management) layer that every real company builds internally.

---

## Tech Stack

- **Runtime:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (access + refresh tokens), bcrypt for password/token hashing
- **Rate Limiting:** express-rate-limit
- **API Docs:** Swagger (OpenAPI 3.0)
- **Testing:** Jest + Supertest

---

## Features

### Authentication
- Signup with bcrypt-hashed passwords
- Login issuing short-lived (15 min) access tokens and long-lived (7 day) refresh tokens
- Refresh tokens are **hashed before storage** — never stored in plain text
- Auth middleware verifying JWTs on protected routes

### Session Tracking
- Every login creates a Session record (device info, IP, expiry)
- Users can view all active sessions
- Users can revoke a specific session manually

### Organizations & Membership
- Any user can create an Organization and automatically becomes its "owner"
- Membership model connects Users ↔ Organizations with a role (owner/admin/member/viewer)
- `loadMembership` middleware confirms a user belongs to an org before allowing access — returns 404 (not 403) to non-members, so org existence is never leaked

### Invitations
- Owners/admins can invite a user by email with an assigned role
- Invites use a cryptographically random token with a 7-day expiry
- Accepting an invite requires the logged-in user's email to match the invited email (prevents token misuse by unintended accounts)

### RBAC (Role-Based Access Control)
- A role-to-permission map defines what each role can do
- `requirePermission()` middleware factory checks a user's role against required permissions before allowing sensitive actions (inviting members, changing roles)
- Deny-by-default: if a permission isn't explicitly granted, the action is rejected

### Audit Logging
- Sensitive actions (login, invite created, invite accepted, role changed) are recorded with actor, target, and timestamp
- Provides a queryable history per organization

### Security Hardening
- Rate limiting on `/auth/signup` and `/auth/login` (5 requests per 15 minutes) to prevent brute-force attacks
- Passwords and refresh tokens are never stored or returned in plain text

---

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/auth/signup` | Create a new account |
| POST | `/auth/login` | Log in, receive access + refresh tokens |
| GET | `/auth/profile` | Protected test route (requires token) |

### Organizations
| Method | Route | Description |
|---|---|---|
| POST | `/orgs` | Create an organization (creator becomes owner) |
| GET | `/orgs/:orgId/members` | List members of an org |
| POST | `/orgs/:orgId/invite` | Invite a user by email (owner/admin only) |
| POST | `/orgs/:token/accept` | Accept an invitation |
| PATCH | `/orgs/:orgId/members/:userId/role` | Change a member's role (owner/admin only) |
| GET | `/orgs/:orgId/audit-logs` | View sensitive-action history |

### Sessions
| Method | Route | Description |
|---|---|---|
| GET | `/sessions` | View all active sessions for the logged-in user |
| DELETE | `/sessions/:sessionId` | Revoke a specific session |

### Docs
| Route | Description |
|---|---|
| `/docs` | Interactive Swagger API documentation |

---

## Data Models

**User** — name, email, hashed password

**Session** — userId, hashed refresh token, device/IP info, expiry, revocation status

**Organization** — name, ownerId

**Membership** — userId, orgId, role (owner/admin/member/viewer), status (active/revoked)

**Invitation** — orgId, email, role, token, status (pending/accepted/expired), expiry

**AuditLog** — orgId, actorId, action, targetType/targetId, metadata, timestamp

---

## Key Design Decisions

- **Refresh tokens are hashed before storage** — if the database is ever leaked, stolen hashes cannot be used to impersonate a session (same reasoning as password hashing).
- **404 instead of 403 for non-members** — prevents leaking whether an organization exists to users without access to it.
- **Role comes from the invitation record, not the request body, when accepting an invite** — prevents a user from granting themselves a higher role than what they were invited with.
- **Email-matching check on invite acceptance** — ensures only the intended recipient can accept an invitation, even if the token is somehow exposed.
- **RBAC via a permission map + middleware factory** (`requirePermission(permission)`) — keeps authorization logic centralized and reusable across routes, rather than scattering role checks inside controllers.
- **Audit logs never block the main action if logging fails** — a failed audit-log write is caught and logged separately, so it never causes a legitimate request (like signup or invite) to fail.

---

## Setup

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file:
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret

4. Run `npm run dev` to start the server
5. Run `npm test` to run the test suite
6. Visit `http://localhost:3000/docs` for interactive API documentation

---

## Testing

Basic integration tests using Jest + Supertest cover:
- Signup validation (missing fields)
- Login credential failures (wrong password, missing fields)

Run with:npm test