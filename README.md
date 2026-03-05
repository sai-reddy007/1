# PentestAI - Production-ready SaaS MVP

## 1) System architecture overview
PentestAI is a multi-tenant SaaS platform that converts static penetration test outputs into a continuous vulnerability intelligence system.

### High-level components
- **Frontend (Next.js + Tailwind + Recharts)**: Dark-themed client portal and analytics dashboards.
- **Backend API (Express + Prisma)**: Auth, RBAC, report ingestion, parsing, enrichment, remediation tracking, marketplace, and mock Jira sync.
- **PostgreSQL**: Tenant-isolated operational data.
- **Redis (optional for MVP)**: Queue and async-ready design.
- **File storage (local uploads/)**: Report intake abstraction designed to be replaced by S3.

### Security controls
- JWT authentication
- bcrypt password hashing
- role-based access control
- tenant-aware API filtering
- input validation with Zod
- secure upload file type and size checks
- audit logging

## 2) Microservice design (evolvable)
Current MVP runs as one deployable API with service modules; it is split for future microservice extraction:
1. **Identity Service** (auth, JWT, RBAC)
2. **Ingestion Service** (file upload + parser dispatch)
3. **Vulnerability Intelligence Service** (normalization, enrichment, duplicate detection, risk scoring)
4. **Workflow Service** (remediation, ticketing/Jira sync)
5. **Marketplace Service** (pentest request lifecycle)
6. **Analytics Service** (dashboard aggregates)

## 3) Project folder structure
```
pentest-ai/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── parsers/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       └── index.ts
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── reports/
│   │   ├── remediation/
│   │   ├── marketplace/
│   │   ├── future-ai/
│   │   └── login/
│   ├── components/
│   └── lib/
├── uploads/
│   └── samples/
└── README.md
```

## 4) Database schema
Implemented tables:
- Users
- Organizations
- Projects
- Reports
- Vulnerabilities
- Assets
- Remediation
- Tickets
- ServiceRequest
- AuditLog

Includes enums for severity, role, service type, and remediation status.

## 5) Backend API
### Key endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET /api/reports`
- `POST /api/reports/upload`
- `GET /api/vulnerabilities`
- `PATCH /api/vulnerabilities/:id/status`
- `POST /api/vulnerabilities/:id/tickets/jira`
- `GET /api/marketplace`
- `POST /api/marketplace`

### Tenant isolation
- JWT includes `organizationId`
- middleware requires org context for non-platform-admin users
- data access queries scoped by `organizationId`

## 6) Frontend UI
- Professional cybersecurity dark UI with neon accents
- Dashboard cards + charts:
  - severity distribution (pie)
  - risk trend (line)
  - asset exposure map (bar)
- Reports page
- Remediation tracker
- Marketplace catalog
- Future autonomous AI pentesting roadmap page

## 7) Report parsers
Parsers implemented in backend:
- Nmap XML
- Nessus XML
- Generic JSON
- Generic XML
- PDF regex extraction

Supports accepted formats for MVP flow and extension points for Burp, Qualys, OpenVAS, ZAP, Nikto, DOCX/CSV/HTML.

## 8) Example vulnerability data
Seed data includes:
- SQL Injection
- Cross-Site Scripting
- Open Port
- Weak TLS Configuration

Each finding is enriched with mapping data (CWE/CVE/OWASP/MITRE/CAPEC where available), risk-scored 0-100, and linked to assets/projects/reports.

## 9) Run locally
### Prerequisites
- Node.js 20+
- PostgreSQL
- Redis (optional)

### Setup
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
npm install
npm run prisma:generate -w backend
npm run prisma:migrate -w backend -- --name init
npm run seed
npm run dev
```

Frontend: http://localhost:3000  
Backend: http://localhost:4000

Login with seeded user:
- `admin@acme-sec.com`
- `ChangeMe123!`

Then open `/login`, authenticate, and dashboard data will load from backend APIs.


## 10) Run with Docker (recommended on your machine)
### Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin)

### Start stack
```bash
cp backend/.env.docker.example backend/.env.docker
docker compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Health: http://localhost:4000/health
- Postgres: localhost:5432
- Redis: localhost:6379

### Notes
- Backend container runs `prisma migrate deploy` on startup.
- Seed runs automatically when `SEED_ON_START=true` in `backend/.env.docker`.
- Uploaded reports are persisted to local `./uploads`.

### Stop stack
```bash
docker compose down
```

### Reset database volume
```bash
docker compose down -v
```
