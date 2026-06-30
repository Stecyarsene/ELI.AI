# ELI ORCHESTRATOR

This system controls all AI agent actions in the repository.

## AGENTS
- Codex: code execution
- Claude: architecture decisions
- Eli Core: product logic
- Orchestrator: validation & control

## RULE
No modification is valid without checking rules.md and schema_snapshot.json.

## ROUTING
Code → Codex  
Architecture → Claude  
Product logic → Eli Core  
Validation → Orchestrator