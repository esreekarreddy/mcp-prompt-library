# Sample PRD: User Authentication System

> Example of a well-structured Product Requirements Document

---

# PRD: User Authentication System

**Author**: Product Team  
**Date**: January 2024  
**Status**: Approved  
**Version**: 1.0

---

## 1. Problem Statement

Currently, our application has no user accounts. Users cannot save their work, preferences are lost on refresh, and we can't personalize their experience. This limits engagement and makes it impossible to offer premium features.

**Who has this problem**: All 50K monthly active users who want to save their work and access it across devices.

**Impact**: 40% of users leave after first session because they can't save progress.

---

## 2. User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-1 | As a new user, I want to create an account with email/password so that I can save my work | Must Have |
| US-2 | As a returning user, I want to log in so that I can access my saved work | Must Have |
| US-3 | As a user, I want to reset my password if I forget it so that I don't lose my account | Must Have |
| US-4 | As a user, I want to stay logged in across browser sessions so that I don't have to log in every time | Must Have |
| US-5 | As a user, I want to log out from all devices so that I can secure my account if a device is lost | Should Have |
| US-6 | As a user, I want to sign up with Google so that I can get started faster | Nice to Have |
| US-7 | As a user, I want to enable 2FA so that my account is more secure | Nice to Have |

---

## 3. Core Features (MVP)

### 3.1 Email/Password Registration
- Email validation (format and uniqueness)
- Password requirements (min 8 chars, 1 number, 1 uppercase)
- Email verification required before account activation
- Welcome email sent on registration

### 3.2 Login
- Email + password authentication
- Rate limiting (5 attempts per 15 minutes)
- Secure session management (30-day expiry)
- Remember me option (extends to 90 days)

### 3.3 Password Reset
- Request reset via email
- Secure, time-limited reset link (1 hour expiry)
- Confirmation email after reset

### 3.4 Session Management
- JWT-based authentication
- Secure HTTP-only cookies
- Automatic token refresh
- Logout (current session)

---

## 4. Out of Scope (v2)

- Social login (Google, GitHub)
- Two-factor authentication
- Magic link login
- Account deletion
- Profile management
- Email change
- Password change (from settings)

---

## 5. Tech Requirements

### 5.1 Stack
- **Backend**: Node.js/Express with TypeScript
- **Database**: PostgreSQL
- **Auth**: JWT with refresh tokens
- **Email**: SendGrid
- **Validation**: Zod

### 5.2 Data Model

```
User
- id: UUID (primary key)
- email: string (unique, indexed)
- passwordHash: string
- emailVerified: boolean
- emailVerificationToken: string?
- emailVerificationExpiry: datetime?
- passwordResetToken: string?
- passwordResetExpiry: datetime?
- createdAt: datetime
- updatedAt: datetime

Session
- id: UUID (primary key)
- userId: UUID (foreign key)
- refreshToken: string (indexed)
- expiresAt: datetime
- createdAt: datetime
```

### 5.3 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create account |
| POST | /auth/login | Log in |
| POST | /auth/logout | Log out |
| POST | /auth/refresh | Refresh tokens |
| POST | /auth/forgot-password | Request reset |
| POST | /auth/reset-password | Complete reset |
| GET | /auth/verify-email | Verify email |
| GET | /auth/me | Get current user |

### 5.4 Security Requirements
- Passwords hashed with bcrypt (cost factor 12)
- All tokens cryptographically random (256-bit)
- HTTPS only
- CSRF protection
- Rate limiting on all auth endpoints

---

## 6. Success Metrics

| Metric | Current | Target | Timeframe |
|--------|---------|--------|-----------|
| User registration rate | 0 | 1000/week | 1 month post-launch |
| Registration completion rate | N/A | > 80% | 1 month |
| Login success rate | N/A | > 95% | Ongoing |
| Password reset completion | N/A | > 70% | Ongoing |
| Session length | 5 min avg | 30 min avg | 3 months |

---

## 7. Open Questions

| # | Question | Owner | Status | Resolution |
|---|----------|-------|--------|------------|
| 1 | Which email provider? | Backend | Resolved | SendGrid |
| 2 | Session duration for "remember me"? | Product | Resolved | 90 days |
| 3 | Minimum password length? | Security | Resolved | 8 characters |
| 4 | Email verification required? | Product | Resolved | Yes, required |

---

## 8. Timeline

| Milestone | Date | Dependencies |
|-----------|------|--------------|
| PRD Approved | Jan 5 | - |
| Design Complete | Jan 12 | PRD |
| Backend Complete | Jan 26 | Design |
| Frontend Complete | Feb 2 | Design |
| Testing Complete | Feb 9 | Backend + Frontend |
| Launch | Feb 12 | Testing |

---

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Email deliverability issues | Medium | High | Use established provider, monitor bounce rates |
| Password breach | Low | Critical | Strong hashing, breach monitoring |
| Session hijacking | Low | High | HTTP-only cookies, short-lived tokens |

---

*This PRD was created using the PRD Generator prompt from ai-library.*
