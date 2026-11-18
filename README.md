# Kulturex Connect — marketplace MVP

Kulturex Connect is a **software project in development** for verified cultural-product sellers and diaspora customers. It is distinct from the existing [Kulturex trading website](https://www.kulturex.co.uk/). A production integration between these systems has **not** been established.

## What is implemented

- Next.js 16, TypeScript, PostgreSQL and Prisma 6 application.
- Buyer registration and login using salted `scrypt` password hashes, hashed database-backed sessions, and HttpOnly cookies.
- Seller profile applications with manual administrator verification.
- Validated seller-created product listings, contact-sharing checks and administrator review before publication.
- Public marketplace queries for **verified sellers and approved products only**.
- Actual database-backed seller dashboard and buyer/seller order views (no hardcoded sales metrics).
- Test-mode Stripe Checkout Session creation; server-side price calculation in integer pence; transactional stock reservation; signed webhook handling for payment success, failure and expiry.
- Unit tests, TypeScript checks, and a GitHub Actions verification workflow.

## What is *not* implemented or verified

- No production deployment, payment transaction, end-to-end database test, or integration with `kulturex.co.uk` was verified in this repository.
- Stripe is intentionally **test-mode only**. Seller payouts, Stripe Connect onboarding, refunds, disputes, taxes, multi-currency payments, shipping and logistics are not implemented.
- Contact-sharing regexes are basic screening, not a complete trust-and-safety or product-authenticity system. Administrators must review listings and verify sellers.
- Before public launch: independent security assessment, rate limiting, email verification, account recovery, abuse protection, bot protection, stock-reservation cleanup/reconciliation, webhook monitoring, regulatory compliance and operational fulfilment processes are needed.
- Each order currently contains one listing. Multi-item baskets and shipping costs are not supported.

## Local setup (new, empty PostgreSQL database)

1. Use Node.js 24+, npm and PostgreSQL.
2. Run `npm ci` and `cp .env.example .env`.
3. Set `DATABASE_URL` to your own development PostgreSQL database and `APP_BASE_URL=http://localhost:3000`.
4. Run `npx prisma migrate deploy`, then `npm run prisma:generate`.
5. Run `npm run dev`; visit `/register`, then `/dashboard`.
6. Create a seller profile through the dashboard. The profile remains unverified by default.

**Migration warning:** The checked-in SQL migration is an **initial schema for an empty database**. The old prototype did not contain checked-in migrations. Do not run this initial migration against an existing Kulturex database with tables or real data without first backing up, reviewing a data-preserving migration, and testing it on a copy. This branch has not been applied to your live Kulturex website.

### Administrator onboarding

After registering your own account in a **development** database, set your role to `ADMIN` through a trusted database administrator session (for example, Prisma Studio or a restricted SQL client). Never expose a public endpoint for self-promotion. The verification APIs are:

- `PATCH /api/admin/sellers/:id/verify` (authenticated admin)
- `PATCH /api/admin/listings/:id/review` (authenticated admin; JSON `{ "approved": true }` or `false`)

The UI for these admin actions is not implemented. New seller listings remain `PENDING_REVIEW` until approved, and only verified sellers can have active listings.

### Stripe testing

Set `STRIPE_SECRET_KEY=sk_test_...` and `STRIPE_WEBHOOK_SECRET=whsec_...` in your local, ignored `.env` file. Do **not** commit credentials. Configure Stripe to forward events to `/api/webhooks/stripe`. With the Stripe CLI, one development option is:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will output the local signing secret. Checkout supports test keys only until operational readiness is independently verified. The checkout endpoint returns a Stripe-hosted URL. The system updates order status from signature-verified webhooks, not from the browser's success redirect.

An abandoned payment reserves inventory until Stripe expiry/failure events are processed. Before live use, add a scheduled reconciliation process to recover reservations if webhooks are delayed or missing.

## API overview

| Route | Methods | Access |
|---|---|---|
| `/api/auth/register` | POST | Public registration |
| `/api/auth/login` | POST | Public login |
| `/api/auth/logout`, `/api/auth/me` | POST / GET | Cookie session |
| `/api/sellers` | POST | Signed-in applicant |
| `/api/listings` | GET / POST | Public approved listings / signed-in seller |
| `/api/orders` | GET | Buyer or seller, own records only |
| `/api/checkout` | POST | Signed-in buyer, verified listing, Stripe test configured |
| `/api/webhooks/stripe` | POST | Signature-verified Stripe webhook |
| `/api/admin/sellers/:id/verify` | PATCH | Administrator |
| `/api/admin/listings/:id/review` | PATCH | Administrator |

## Quality checks

```bash
npm run prisma:generate
npm run typecheck
npm test
npm run build
```

Unit tests cover validation, password hashing, money invariants and moderation. **No automated test here proves a real PostgreSQL transaction, Stripe webhook delivery, production security or commercial adoption.**

### Dependency check (18 November 2026)

The Next.js and Zod dependency ranges were upgraded after a security review. A subsequent `npm audit --omit=dev --audit-level=high` still reported a high-severity advisory in `deepmerge-ts@7.1.5` reached through Prisma 6's configuration tooling. Treat this as an outstanding dependency risk and review compatible Prisma upgrades; the application has **not** passed a clean security audit.

## Contribution evidence

Git commits show the actual work and dates. Repo code is evidence of implementation, **not** independently verified product adoption or significant commercial impact. Keep deployments, tests, decisions, merchant activity and third-party outcomes separately for any formal assessment.
