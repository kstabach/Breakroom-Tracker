# 🧠 Breakroom Tracker Ideas – Consolidated Master
**Version:** vFinal (Nov 2025)  
**Last Sync:** Apps Script v1.5.1 | Roadmap v1.7 | Status: Active Development  

---

## I. Tracker-Specific Enhancements

| Area | Idea | Summary / Next Action |
|------|------|------------------------|
| **UI/UX Controls** | Move system status row to top | Improves visibility of core metrics; move A18–C18 (“Last Trigger Run”) to header row. |
|  | Replace “Auto-Refresh” toggle with refresh icon | Remove A10–C10 nonfunctional toggle; add manual refresh button. |
|  | Clickable metric badges | Allow “✅ Completed” metrics to hyperlink to underlying reports. |
| **Automation** | Hourly auto-refresh | Replace 15-min trigger with 1-hour interval; log last execution. |
| **Security / Access** | Default lock-down policy | All tabs default read-only; only admin (you) + approved fields editable. |
| **Data Architecture** | Dynamic “agency churn journey” tracking | Track accounts that leave an agency → map if they land elsewhere or direct. Use SFDC data signals to auto-flag statuses. |
| **Telemetry** | Enhanced runtime logging | Capture execution time, user, and sheet latency. Integrate with Atlas JSON logs. |

---

## II. Tracker-Adjacent / Supporting Use Cases

| Category | Concept | Summary / Goal |
|-----------|----------|----------------|
| **CSM HQ Dashboard** | Campaign importer + signal predictor | Imports campaign data → auto-analyzes → shows predictions + clickable campaign links. |
| **ARM Dashboard** | Account hygiene & predictive signals | GSheet tool for ARM/Main users to view KPIs, clean contacts, and classify account states. |
| **Atlas Integration** | Cross-agent telemetry | Share Breakroom event logs to Command Center and Atlas summary agents. |
| **Prompt-Based Assistant** | Breakroom PM Persona GPT | Custom GPT trained on PM workflow (with A/B test behavior, option-based UX, semantic parsing). |
| **Agent Sync** | n8n/Zapier hybrid | Automate doc + script updates through Sheets → AI → Editor or Drive sync. |
| **Backup System** | Context & build backup | Split backup: A = product context, B = tracker build package, C = docs catch-all. Enable “plug-and-play” restoration. |

---

## III. Global / Meta Ideas

| Area | Idea | Description |
|------|------|-------------|
| **Automation Flow** | Zapier-based build pipeline | Use Sheets as source of prompts → AI → update code/docs automatically (fallback: n8n). |
| **Editor UX** | Multi-level sidebars | Support nested sidebars; pop-ups for confirmations. Mimic native app navigation. |
| **Output Formatting** | Platform-native exports | Use JS/JSON/YAML per platform (Apps Script, Atlas, Zapier, Docs). |
| **Feedback Loop** | Daily auto idea review | Automate doc scanning → summarize → integrate top changes to roadmap. |
| **Machine Learning Layer** | Self-testing responses | Continue blind A/B testing with one-character user confirmations to improve prompt tone and UX. |

---

## IV. Immediate Priorities

- [ ] Implement locked-down tabs logic (admin-only editable by default)
- [ ] Migrate nonfunctional buttons → refresh icon and status top bar
- [ ] Activate hourly trigger
- [ ] Integrate telemetry JSON output with Atlas
- [ ] Begin CSM HQ prototype using existing Tracker schema
- [ ] Build backup package (A/B/C) for full portability
