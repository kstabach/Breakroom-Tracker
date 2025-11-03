# Agency Breakroom Tracker
**Version:** v1.7 Preview (Integrated Nov 2025)  
**Last Sync:** Tracker Ideas vFinal | Apps Script v1.5.2 | Status: Live  

This project is a Google Apps Script dashboard for tracking the Agency Breakroom project.  
All code is managed via `clasp` and GitHub.

---

## 🚀 Roadmap

### ✅ PHASE 1 — Core Foundation
Stable v1.5.2 deployed; telemetry verified.

---

### 🧩 PHASE 2 — UX + Beta Automation (Live)

| Feature | Summary | Owner | Status |
|----------|----------|--------|--------|
| Dashboard Refresh+ | New top-row status, clickable metrics | Kenny | ✅ Live |
| Quick Add Panel v2 | Cached modal entry form | Kenny | 🧪 Testing |
| Log Analytics | Pivoted INFO/WARN/ERROR breakdown | Rory | ⚙️ In Build |
| Slack Notifier | n8n bridge for success/failure alerts | Becky | 🧩 Beta |
| Atlas Telemetry | JSON export w/ function runtime + latency | Kenny | 🧠 Active |
| Undo Logs | Rollback after manual clear | Becky | ✅ Complete |

---

### 🚧 PHASE 3 — Integrations & Extensions

- [ ] Command Center Bridge (shared metrics + logging layer)
- [ ] Breakroom → Atlas → Command Center telemetry pipeline
- [ ] CSM HQ Dashboard (campaign intelligence feed)
- [ ] Agency Churn Journey Tracker prototype
- [ ] Hourly Trigger + refresh icon rollout

---

### 🧭 PHASE 4 — v2.0 Platformization

- [ ] Side-panel UI via Card Service
- [ ] Multi-sheet structure (Accounts, Campaigns, Diagnostics)
- [ ] AI-summarized dashboards via Breakroom Agent v2
- [ ] Auto-rollback + visual version changelog
- [ ] Daily automated idea-review integration

---

## 🗓️ Milestones

| Date | Milestone | Owner |
|------|------------|--------|
| Nov 8 2025 | Atlas Telemetry test | Kenny |
| Nov 12 2025 | Slack alerts live | Becky |
| Nov 18 2025 | Command Center bridge | Kenny / Rory |
| Dec 2025 | Start v2.0 refactor | Team |

---

## 🧠 Notes

- Codex integration flagged for syntax acceleration (trial pending)
- N8N/Zapier pipeline slated for Q1 2026 agent automation
- All Breakroom assets consolidated under one “Build Package” schema

---

## ⚙️ How to Develop

1. Clone this repo  
2. Run `npm install`  
3. Run `clasp login` and authenticate  
4. Pull down the latest code: `clasp pull`  
5. Push changes up: `clasp push`
