# CertiLens 🔐

> Real-time SSL/TLS certificate intelligence platform built with Next.js, PostgreSQL, and Node.js TLS

**Live Demo:** https://certilens.vercel.app  
**Built by:** Harshvardhan Singh Shekhawat — B.Tech CSE 2nd Year, Cloudflare-stack Networking Intern  
**GitHub:** https://github.com/Harshvardhan-Singh-Shekhawat/certilens

---

## What is CertiLens?

CertiLens monitors SSL/TLS certificates for any domain using **live TLS handshakes** — not third-party APIs, not cached data. Every scan connects directly to the target domain, parses the full certificate chain, and scores it using a weighted risk algorithm.

This is the same category of tooling that powers Cloudflare's SSL for SaaS, Certificate Transparency Monitoring, and Zero Trust certificate inspection.

---

## Features

### 🔐 Live TLS Handshake Engine
- Node.js `tls.connect()` against real domains
- Parses: subject, issuer, SANs, validity period, key size, signature algorithm, chain depth
- Zero fake data — every number comes from a real certificate

### ⚡ Weighted Risk Scoring Algorithm
Multi-factor scoring across 4 dimensions (0–100):

| Factor | Max Points | Logic |
|---|---|---|
| Expiry | 50 | ≤7 days = 45pts, ≤30 days = 25pts |
| Key Strength | 25 | <2048 bits = 20pts, <1024 = 25pts |
| Signature Alg | 15 | MD5 = 15pts, SHA1 = 10pts |
| Chain Depth | 10 | Depth 0 = 10pts (self-signed) |

### 🧠 DBSCAN Anomaly Detection
- Implemented DBSCAN clustering from scratch — no ML library used
- Clusters scans on 3 dimensions: risk score, days until expiry, key bit strength
- Noise points flagged as anomalies — catches unusual cert rotation patterns
- Applied from DAA coursework to real certificate data

### 🌐 Certificate Transparency Log Monitoring
- Queries crt.sh (the public CT log aggregator used by Cloudflare)
- Detects unexpected issuers, wildcard certificates, rapid issuance
- Cross-references certificate history against live scan data

> **Note:** crt.sh occasionally rate-limits requests from cloud hosting IPs.
> CT log queries work reliably from local environments.
> This is a known limitation of the free crt.sh public API.

### 📊 Certificate Chain Visualization
- D3.js animated graph: Root CA → Intermediate → Leaf
- Color-coded by risk level (green = low, yellow = medium, red = critical)
- Expand/collapse per domain on the Domains page

### 🔔 Auto-Alert System
- Alerts auto-generated when risk score ≥ 40 or expiry ≤ 30 days
- Severity levels: critical / high / medium
- Full alert history with timestamps

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes, Node.js |
| Database | PostgreSQL (Railway) via Prisma ORM |
| Auth | NextAuth.js with JWT + bcrypt |
| TLS Engine | Node.js built-in `tls` module |
| Visualization | D3.js |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## Architecture
User → Next.js App
├── /api/domains    → Add/list domains (PostgreSQL)
├── /api/scan       → Live TLS handshake → Risk score → Store scan
├── /api/ctlogs     → Query crt.sh CT logs → Anomaly analysis
└── /api/anomalies  → DBSCAN on scan history → Noise detection
---

## Database Schema
User
└── Domain (hostname)
├── Scan (TLS data, risk score, expiry, issuer, key bits, chain)
└── Alert (type, severity, message)
---

## Why This Project

Cloudflare terminates TLS for millions of domains. Their SSL for SaaS, Certificate Transparency Monitoring, and Zero Trust products are built on exactly this kind of certificate intelligence.

CertiLens applies:
- **OS/Networks** coursework → TLS handshake internals
- **DBMS** coursework → Relational schema, complex joins
- **DAA** coursework → DBSCAN implemented from scratch
- **ML** coursework → Unsupervised clustering on real data

Built during a Cloudflare-stack networking internship. Every feature is functional — no hardcoded data, no seeded database, no fake ML.

---

## Local Setup

```bash
git clone https://github.com/Harshvardhan-Singh-Shekhawat/certilens.git
cd certilens
npm install
```

Create `.env`:

```env
DATABASE_URL="your-postgresql-url"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="optional-for-email-alerts"
```

```bash
npx prisma db push
npx prisma generate
npm run dev
```

Open `localhost:3000`.

---

## Live Demo

Open [certilens.vercel.app](https://certilens.vercel.app), sign up, and add any domain — `github.com`, `cloudflare.com`, `spotify.com`. Watch the live TLS scan run in real time, then click **View Chain** to see the animated certificate chain graph.