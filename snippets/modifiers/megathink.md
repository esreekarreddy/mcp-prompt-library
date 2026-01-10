---
title: Megathink
description: Maximum thinking budget for architecture decisions, incident response, and critical code
tags: [modifier, extended-thinking, architecture, critical, deep-analysis]
aliases: [max-think, extended-thinking, deep-dive]
version: 1.0.0
---

# Megathink

> When ultrathink isn't enough. Use for decisions that will cost weeks to undo.

## The Core Insight

**Megathink** is for situations where:
- The decision affects the entire system architecture
- Reverting would take weeks of engineering time
- Security or data integrity is at stake
- You're responding to a production incident
- The cost of being wrong is very high

This triggers Claude's maximum thinking budget and most systematic analysis mode.

---

## The Snippet

### Standard
```
MEGATHINK. This is a critical decision that will be expensive to reverse.

Before responding, I need you to:
1. List every assumption I'm making (stated and unstated)
2. Consider at least 5 different approaches
3. For each approach, identify 3 ways it could fail
4. Consider the 6-month maintenance implications
5. Think about team skill levels and learning curves
6. Consider cost, security, and scalability together
7. Only then make a recommendation with full reasoning
```

### Architecture Variant
```
MEGATHINK: ARCHITECTURE MODE

This is an architecture decision. Consider:
- How will this scale to 10x, 100x current load?
- What's the team's familiarity with this technology?
- What's the operational burden? (Monitoring, debugging, on-call)
- How does this interact with existing systems?
- What's the migration path from current state?
- What are we locking ourselves into?
- What's the cost to reverse this decision?

Provide a decision matrix with weighted criteria.
```

### Incident Response Variant
```
MEGATHINK: INCIDENT MODE

We have a production incident. Before any fix:
1. What do we know FOR CERTAIN? (not suspected)
2. What are the possible root causes?
3. What's the blast radius of each potential fix?
4. What could make this worse?
5. What's the minimal safe intervention?
6. What rollback plan do we have?
7. Who else needs to be informed?

Provide a step-by-step action plan with checkpoints.
```

### Security Variant
```
MEGATHINK: SECURITY MODE

Assume an attacker is looking at this code. Think like a red team:
1. What data does this touch? (PII, credentials, financial)
2. Who can access this? Who SHOULD be able to?
3. What are ALL the input paths?
4. What happens with malicious input?
5. What are the privilege escalation paths?
6. What does the audit log capture?
7. What's the blast radius if compromised?

Provide a threat model and mitigation plan.
```

---

## When to Use

| Scenario | Ultrathink | Megathink |
|----------|------------|-----------|
| Complex bug | ✅ | ❌ |
| API design | ✅ | ✅ |
| Database schema | ❌ | ✅ |
| Auth system changes | ❌ | ✅ |
| Framework choice | ❌ | ✅ |
| Production incident | ❌ | ✅ |
| Performance optimization | ✅ | ❌ |
| Code review | ✅ | ❌ |
| Architecture migration | ❌ | ✅ |

---

## Example: Database Schema Decision

**User Prompt:**
> We need to add multi-tenancy to our SaaS app. Currently all customers share one database. How should we approach this?

**With MEGATHINK - Full Analysis:**

```markdown
## Multi-Tenancy Architecture Decision

### Assumptions I'm Identifying

**Stated:**
- Single shared database currently
- Need tenant isolation

**Unstated (need to verify):**
- Number of tenants expected? (10? 1000? 100,000?)
- Data volume per tenant?
- Performance isolation requirements?
- Compliance requirements? (SOC2, HIPAA, GDPR)
- Cross-tenant reporting needed?
- Budget for infrastructure changes?
- Team's database expertise?

### Five Approaches

#### 1. Row-Level Security (Tenant ID Column)
Add `tenant_id` to every table, enforce via application or RLS.

**Pros:**
- Minimal infrastructure change
- Easiest to implement
- Cross-tenant queries possible

**Cons:**
- Developer discipline required
- One bug = data leak
- Noisy neighbor problems
- Hard to delete tenant data

**Failure Modes:**
1. Developer forgets WHERE clause → cross-tenant data leak
2. Index bloat as tenants grow
3. One tenant's heavy query affects all

#### 2. Schema-Per-Tenant (PostgreSQL Schemas)
Each tenant gets own schema: `tenant_123.users`

**Pros:**
- Better isolation
- Easier to backup/restore per tenant
- Can use search_path for security

**Cons:**
- Schema migrations across 1000+ schemas
- Connection management complexity
- Harder cross-tenant analytics

**Failure Modes:**
1. Migration fails on one schema → inconsistent state
2. Connection pool exhaustion
3. Schema count limits in some DBs

#### 3. Database-Per-Tenant
Separate database instance per tenant.

**Pros:**
- Maximum isolation
- Independent scaling
- Easiest compliance story

**Cons:**
- Expensive at scale
- Complex provisioning
- Operational burden (patching, backups)

**Failure Modes:**
1. Operational complexity → missed patches
2. Cost explosion with tenant growth
3. Slow tenant provisioning

#### 4. Hybrid: Shared + Premium Isolated
Small tenants share; enterprise gets dedicated.

**Pros:**
- Cost-efficient for small tenants
- Premium option for enterprise
- Scalable business model

**Cons:**
- Two systems to maintain
- Data migration between tiers
- Complex routing logic

**Failure Modes:**
1. Routing bug → wrong database
2. Feature parity drift between tiers
3. Migration failures

#### 5. Citus/Vitess Distributed Database
Shard by tenant_id using distributed PostgreSQL.

**Pros:**
- Horizontal scaling
- Query routing handled by Citus
- Looks like single database

**Cons:**
- Operational complexity
- Cross-shard query limitations
- Team needs to learn new patterns

**Failure Modes:**
1. Shard rebalancing during peak
2. Cross-shard transaction issues
3. Query planner surprises

### Decision Matrix

| Criteria (Weight) | Row-Level | Schema | Database | Hybrid | Distributed |
|-------------------|-----------|--------|----------|--------|-------------|
| Security (30%) | 2 | 3 | 5 | 4 | 3 |
| Cost (20%) | 5 | 4 | 1 | 3 | 3 |
| Operational (20%) | 5 | 3 | 2 | 2 | 2 |
| Scale (15%) | 2 | 3 | 5 | 4 | 5 |
| Team Skill (15%) | 5 | 4 | 3 | 3 | 2 |
| **Weighted Total** | 3.6 | 3.4 | 3.2 | 3.3 | 3.0 |

### My Recommendation

**Start with Row-Level Security, plan migration path to Hybrid.**

**Reasoning:**
1. Fastest time to market (weeks, not months)
2. Learn tenant usage patterns before over-engineering
3. Clear migration path when you need it
4. Matches team's current PostgreSQL expertise

**Implementation safeguards:**
1. Use PostgreSQL RLS policies at database level
2. Abstract tenant_id injection into ORM middleware
3. Add integration tests that verify isolation
4. Regular security audits of tenant boundaries

**Trigger for migration:**
- Enterprise customer requires dedicated
- Performance isolation becomes critical
- Compliance requirement mandates it

### 6-Month Maintenance View

**What we'll be doing:**
- Ensuring every new table has tenant_id + RLS policy
- Running tenant isolation tests in CI
- Monitoring for cross-tenant query mistakes
- Building tooling for tenant data export

**What could go wrong:**
- New developer skips RLS on new table
- Performance degradation from large tenants
- Audit log showing we need stronger isolation

**Mitigation:**
- PR template checklist for multi-tenancy
- Automated tests checking for missing RLS
- Alerting on single-tenant query dominance
```

---

## Combinations

### Megathink + Critique
```
MEGATHINK this decision. After your recommendation, put on your critic hat
and find every way your own recommendation could be wrong.
```

### Megathink + Simplify
```
MEGATHINK this first. Then explain your recommendation so simply that a
product manager could make the call.
```

### Megathink + Timeline
```
MEGATHINK this. Include a realistic implementation timeline with milestones
and decision checkpoints.
```

---

## When NOT to Use

1. **Regular coding tasks** - Overkill, wastes time
2. **Well-understood patterns** - No need to re-analyze solved problems
3. **Reversible decisions** - Save megathink for costly reversals
4. **When you need to move fast** - Sometimes good enough is good enough

---

## See Also

- [[ultrathink]] - For complex but less critical decisions
- [[deep-debugger]] - For systematic incident analysis
- [[security-audit]] - For security-focused deep analysis
