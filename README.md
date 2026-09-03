# Gig FinancialBridge

> **Your income may be informal. Your financial identity shouldn't be invisible.**

FinancialBridge is a fintech hackathon prototype that creates a **trusted alternative
financial identity** for gig workers, daily-wage workers, freelancers and informal
workers — people who earn real money but have no salary slip, no fixed-salary bank
account, and therefore no financial identity a bank can read.

---

## The problem

A salaried employee has an automatic financial identity: every month their salary lands
in a bank account, and banks can evaluate their income, stability and behaviour.

A daily-wage worker may earn **₹800 in cash every day**. A gig worker may earn
**₹35,000 one month, ₹22,000 the next, ₹40,000 the next, and ₹18,000 after that.**
The earning capacity is real and consistent — but to the traditional financial system,
these workers are **financially invisible**:

- Cash wages leave no formal record.
- Irregular digital income looks "unstable" to models built for fixed salaries.
- Without verifiable income, formal credit, insurance and savings products stay out of reach.

## The solution

FinancialBridge combines **consented digital financial data** with **verified informal
income** and **financial behaviour** to build an alternative financial identity:

1. **Consented data connection** (demo) — transactions imported after explicit consent.
   *No passwords, PINs or OTPs are ever requested.*
2. **Cash-income verification** — self-reported income is always **UNVERIFIED** until an
   employer confirms it or supporting evidence exists. The system never auto-trusts.
3. **Income Confidence Score (0–100%)** — how strongly the reported income is supported:
   self-reported → 30% weight, work evidence / digital record → 80–90%, employer/payment
   verification → 95%.
4. **Financial Resilience Score (0–900)** — a transparent prototype score across six
   factors (see methodology below).
5. **Responsible AI insights + adaptive savings** — observations are worded carefully
   ("you may consider…", "based on your available data…"), and savings recommendations
   scale up and down with each month's actual income.
6. **Consent-gated partner-bank view** — the bank sees a profile only while the worker's
   consent is active, and only ever sees suitability for *further assessment*.

> **What this is not:** FinancialBridge is **not a credit bureau** and does not replace
> CIBIL or any official score. The Financial Resilience Score is a **prototype
> supplementary indicator**. It never guarantees loan approval — the final lending
> decision always belongs to the bank, based on its own assessment, policies and
> applicable regulations.

---

## User roles

| Role | Seeded account | What they do |
|---|---|---|
| **Worker** | `ravi@demo.com` | Mobile-first dashboard, score & confidence, transactions, cash-income recording, savings, emergency fund, insights, connect accounts, consent control |
| **Worker 2** | `meena@demo.com` | Daily-wage worker with employer-verified wages |
| **Employer** | `employer@demo.com` (ABC Construction) | Sees pending verification requests, confirms/rejects payments, worker list, payment history |
| **Partner Bank** | `bank@demo.com` (Unity Trust Partner Bank) | Views only consented worker profiles, score breakdowns, consented-data register, financial assessment |

**Password for all demo accounts: `demo123`**

You can also register brand-new accounts for any role — a fresh worker starts with no
data and walks through the full journey.

## Demo flow (the story this project tells)

1. **Worker registers** → completes profile (worker type, city, platform, work start).
2. **Connects a demo financial account** — picks an institution, reviews exactly which
   data is requested (transaction history, income, expenses), approves consent →
   6 months of synthetic transactions are imported.
3. **Records a cash wage** — e.g. *Sept 3 · ABC Construction · masonry work · ₹800* →
   the entry appears as **UNVERIFIED** with low confidence.
4. **Employer logs in** → sees the pending request *"Ravi Kumar — masonry work — ₹800"*
   → clicks **Confirm**.
5. The record becomes **VERIFIED**, and the **Income Confidence Score** and
   **Financial Resilience Score** are recalculated automatically.
6. The worker receives **insights** (income volatility, pressure warnings, surplus
   suggestions) and an **adaptive savings** recommendation that follows income.
7. The worker **grants consent** to share the profile with Unity Trust Partner Bank.
8. **Bank logs in** → sees the worker's scores, income stability, verification status and
   a determination such as *"Potentially suitable for further assessment"* — never
   "Loan Approved".
9. The worker can **revoke consent** at any time; the bank's access disappears instantly.

---

## Scoring methodology (fully transparent prototype)

The analytics layer is rule-based and explainable by design — no black boxes. The same
pipeline would, in a production deployment, be implemented in **Python (Pandas, NumPy,
Scikit-learn, XGBoost)** alongside a partner bank's own regulated models.

### Income Confidence Score (0–100%)

Amount-weighted average of confidence levels across all income records:

| Support type | Confidence weight |
|---|---|
| Self-reported only (unverified) | 30% |
| Verified work records / evidence | 80% |
| Digitally imported income (consented connection) | 90% |
| Employer / payment confirmation | 95% |

- ≥ 85 → **high** · 60–84 → **medium** · < 60 → **low**
- The UI always explains *why* the score is what it is.

### Financial Resilience Score (0–900)

| Factor | Weight | How it is computed |
|---|---|---|
| Income consistency | 25% | 100 − 70 × coefficient of variation of monthly income |
| Income verification confidence | 18% | the Income Confidence Score above |
| Savings behaviour | 17% | savings rate × 650, capped at 100 |
| Repayment behaviour | 16% | on-time repayments ÷ total repayments (neutral 60 if none) |
| Expense management | 12% | (1 − expense/income ratio) ÷ 0.35 × 100, capped |
| Work & income history length | 12% | months of history ÷ 24 × 100, capped |

`score = round(weighted_average / 100 × 900)` — the seeded worker lands around
**748/900** with **89%** income confidence.

Other computations:

- **Income variability** — coefficient of variation of monthly income.
- **Essential expenses** — average monthly spend on Rent, Groceries, Fuel, Utilities,
  Mobile and EMI.
- **Emergency fund target** — 3 × essential monthly expenses.
- **Adaptive savings** — 10% of monthly income in strong months (≥ ₹38,000), tapering to
  2% in very lean months, always protecting essential expenses first.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js (App Router)                     │
│                                                                  │
│  Worker PWA-style UI   Employer Portal    Partner-Bank Portal    │
│  (mobile-first)        (desktop-rich)     (desktop-rich)         │
│         │                    │                    │              │
│         └──── Server Components + Route Handlers (/api/*) ───────┤
│                              │                                   │
│     ┌────────────────────────┼──────────────────────────┐        │
│     ▼                        ▼                          ▼        │
│  lib/auth.ts            lib/data.ts               lib/scoring.ts │
│  (sessions, scrypt      (aggregates &             (resilience &  │
│   password hashing)      consent gating)           confidence)   │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               ▼
                  PostgreSQL  (Drizzle ORM)
   users · sessions · worker/employer/bank profiles · work_history
   income_entries · transactions · repayments · consents
```

**Technology stack**

- **Frontend:** React 19 + TypeScript, Tailwind CSS 4, Recharts, Lucide icons,
  Inter / Space Grotesk variable fonts (self-hosted)
- **Backend:** Next.js route handlers (REST) + server components, cookie-based sessions,
  scrypt password hashing
- **Analytics layer:** transparent TypeScript scoring engine (prototype of the Python
  Pandas/NumPy/Scikit-learn/XGBoost pipeline described for production)
- **Database:** PostgreSQL via Drizzle ORM
- **Demo data:** deterministic synthetic transaction generator (seeded PRNG)

### Key source files

| Path | Purpose |
|---|---|
| `src/lib/scoring.ts` | Resilience score, confidence score, adaptive savings, emergency fund |
| `src/lib/insights.ts` | Responsible rule-based AI insights |
| `src/lib/data.ts` | Aggregations + consent-gated bank views |
| `src/lib/demo-data.ts` | Mock institutions + synthetic transaction generator |
| `src/app/api/*` | Auth, income, verification, consent, connect, savings |
| `scripts/seed.ts` | Idempotent demo seed |
| `src/db/schema.ts` | Full data model |

## Security & trust principles

- Self-reported income is **never** auto-verified; only employers can confirm.
- Employer verification is scoped: an employer can only act on records addressed to them.
- Bank dashboards enforce consent at the data layer — revoked workers return nothing.
- Passwords stored as salted scrypt hashes; sessions are httpOnly cookies.
- **No real credentials, ever:** the demo connection has no password/PIN/OTP fields at all.

---

## Running locally

```bash
npm install
npx drizzle-kit push        # create tables (drizzle.config.json → app_db)
npx tsx scripts/seed.ts     # demo users + synthetic data (idempotent)
npm run dev                 # http://localhost:3000
```

## Limitations (hackathon scope)

- All financial data is **synthetic**; institutions are mock demos.
- The scoring engine is an illustrative heuristic, not a validated statistical model.
- No integration with real payment rails, bureaus, or bank systems.
- Employer identity is assumed honest; production would require KYC-bound business accounts.

## Future integration possibilities

- **Authorized consent-based data sharing** (e.g. India's Account Aggregator framework)
  for real transaction rails with cryptographic consent artefacts.
- **Python analytics service** (FastAPI + Pandas/NumPy/Scikit-learn/XGBoost) for
  validated, regulator-scrutinized scoring models.
- **Employer payroll / gig-platform APIs** for automatic wage confirmations at scale.
- **Bank LOS integration** — the alternative profile as a supplement inside a partner
  bank's existing loan-origination workflow (the bank's own assessment always decides).
- **Vernacular, voice-first UX** for workers with limited digital literacy.

## License

Hackathon demonstration project. Not for production use. Not financial advice.
