# Open questions and risks — SRS review

This file collects unanswered questions and operational risks that must be resolved during SRS implementation. It intentionally avoids referencing legacy code and focuses on target requirements.

## 1. Questions to resolve

### 1.1 Permissions and roles
- Confirm role responsibilities and scopes for `ADMIN`, `MANAGER`, `TEACHER`, `SUPPORT`, `STUDENT` (CRUD boundaries, read-only vs write scopes).
- Define whether any admin sub-roles require elevated permissions (e.g., finance operators for refunds).

### 1.2 Payment and transactions
- Define canonical payment statuses and lifecycle for orders (e.g., PENDING, AUTHORIZED, PAID, FAILED, REFUNDED, CANCELLED).
- Specify webhook contract requirements: idempotency keys, signature verification, timestamp tolerance, and retry behavior.
- Define refund and reversal processes and data consistency expectations across balance, order and ledger.

## 2. Risks and technical debt

### High
- Webhook security and idempotency gaps can cause double charges or inconsistent order state.

### Medium
- Ownership and expiry semantics for book codes and bundles must be defined to avoid access leakage.

### Low
- Missing explicit consumers for certain report endpoints; validate necessity before implementing.

## 3. Recommendations (priority)
1. Define payment webhook contract and implement idempotency and signature verification before enabling payment flows in production.
2. Formalize order/payment state machine and acceptance criteria (logs, reconciliation process).
3. Create UAT scenarios for checkout, refunds, wallet top-up, and webhook retries.

## 4. Module 08 (Reporting/Integration)
- Module 08 is defined as part of the SRS and should include clear API contracts for exports/imports, job orchestration, and reconciliation flows. Do not rely on legacy controllers for scope decisions; specify expected datasets, schedule, and metrics.
