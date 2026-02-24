# 🤖 RegGuard
### AI Agent for Manual Regression Testing
Built as part of ShiftSync Community — AI Agents in Testing Assignment

---

## What is RegGuard?
RegGuard is a lightweight AI Agent that solves a real QA problem:
testers bulk-marking test cases in Zephyr without actually executing them.

## The Problem It Solves
- Testers skip Zephyr test cases and mark all as PASS from memory
- No visibility into actual coverage across Stage, Beta, and Production
- High priority test cases get missed before releases

## Three Phases

### Phase 1 — Bulk Mark Detector (detector.js)
Detects when a tester marks 5+ test cases as PASS within 3 minutes.
Flags suspicious sessions and alerts the QA Lead.

### Phase 2 — Coverage Report Generator (coverage.js)
Tracks which test cases were actually executed per environment.
Generates a Coverage Health Report with a release recommendation.

### Phase 3 — AI Checklist Generator (prompt-template.md)
A reusable Claude AI prompt that reads any PRD and generates
a structured test checklist for Stage, Beta, and Production.

## How to Run

### Prerequisites
- Node.js installed

### Run Bulk Mark Detector
node detector.js

### Run Coverage Report
node coverage.js

### Use AI Checklist Generator
- Open prompt-template.md
- Copy the contents
- Paste into Claude.ai (https://claude.ai)
- Replace [PASTE YOUR PRD TEXT HERE] with your actual PRD
- Get your test checklist instantly!

## Tech Stack
- JavaScript (Node.js) — Phase 1 & 2
- Claude AI (free) — Phase 3
- Jira + Zephyr — Test case source (simulated in this demo)
- Notion — Coverage dashboard
- Google Forms — Evidence collection

## Agent Details
- Agent Name: RegGuard
- Agency Level: Semi-Autonomous
- STLC Phase: Test Execution → Sign-off Gate
- Controlled by: QA Lead / Test Manager

## Built By
Sahithya 