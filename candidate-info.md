# Candidate Information

- **Name:** Himanshu Rawat <!-- update if incorrect -->
- **Role:** Software Engineer
- **Primary Technology Stack:** Full-Stack (React + Node.js + TypeScript)
- **Primary AI Tool Used:** Cursor
- **Project Option Selected:** Support Ticket Management System (Backend-heavy) — Core tier
- **Assessment Start Date:** 2026-07-23
- **Submission Date:** _to be filled at submission_

## Project Summary

A Support Ticket Management System that lets internal users create, list, view,
update, and comment on support tickets, and move them through an enforced status
lifecycle (Open → In Progress → Resolved → Closed, with Cancellation paths).
The backend enforces the status state machine and input validation; the frontend
presents tickets with keyword search and status filtering and surfaces error
states clearly.

## Tools Used

- **Cursor** — primary AI pair-programming environment (context-setting, planning,
  code generation, test generation, debugging, and review).
- **Node.js 20 / npm** — backend and tooling runtime.
- **Prisma** — schema modelling and migrations.
- **Docker** — local PostgreSQL instance.
- **Jest + Supertest** — integration testing.

## Setup Summary

1. `nvm use` (Node 20).
2. `docker compose up -d db` to start PostgreSQL.
3. Backend: copy `.env.example` → `.env`, `npm install`, migrate, seed, `npm run dev`.
4. Frontend: `npm install`, `npm run dev`.

Full instructions live in `README.md` and `database/setup-notes.md`.
