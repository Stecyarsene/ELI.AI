# ELI AGENT SYSTEM

This repository is controlled by an AI multi-agent system.

## ENTRY RULE

Before doing ANY work, every agent MUST read:

- eli-os/orchestrator.md
- eli-os/rules.md
- eli-os/schema_snapshot.json

## AGENTS ROLES

- Codex → code execution
- Claude → architecture design
- Eli Core → product logic
- Orchestrator → validation & safety

## HARD RULES

- Never duplicate existing Supabase schema
- Never bypass Decision Engine logic
- Never create parallel systems
- Always prefer minimal safe changes

## SYSTEM PRINCIPLE

Eli is an AI-native adaptive learning system, not a traditional SaaS.