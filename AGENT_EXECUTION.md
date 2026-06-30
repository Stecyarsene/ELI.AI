# AGENT EXECUTION CONTRACT

All AI agents (Codex, Copilot, etc.) working on this repository MUST follow this execution protocol.

---

## 1. PRE-EXECUTION CHECK

Before any modification:

- Read AGENTS.md
- Read eli-os/orchestrator.md
- Read eli-os/rules.md
- Read eli-os/schema_snapshot.json

---

## 2. DECISION RULE

If a feature already exists:
→ MODIFY, never recreate

If schema is involved:
→ MUST validate against schema_snapshot.json

If uncertainty exists:
→ STOP and request clarification

---

## 3. SAFE MODE ENFORCEMENT

Never:
- duplicate Supabase tables
- bypass Decision Engine
- create parallel systems
- ignore existing architecture

---

## 4. EXECUTION FLOW

Read → Analyze → Compare → Execute → Validate → Log

---

## 5. PRINCIPLE

This repository is an AI-native adaptive system.
Not a standard SaaS project.