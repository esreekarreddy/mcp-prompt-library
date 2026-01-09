# Workflow: Incident Response

> Systematic approach to production incidents

## Severity Levels

| Level | Definition | Response Time | Example |
|-------|------------|---------------|---------|
| **SEV1** | Complete outage | Immediate | Site down, data loss |
| **SEV2** | Major degradation | < 15 min | Core feature broken |
| **SEV3** | Minor degradation | < 1 hour | Non-critical bug |
| **SEV4** | Minimal impact | Next business day | Cosmetic issues |

## Incident Response Process

### 1. Detect & Alert (0-5 min)
- Monitoring alerts fire
- User reports issue
- Team member notices problem

**Immediate Actions:**
```bash
# Acknowledge the alert
# Assess initial severity
# Start incident channel/call if needed
```

### 2. Assess & Communicate (5-15 min)

**Questions to Answer:**
- What is broken?
- Who is affected?
- When did it start?
- What changed recently?

**Communication Template:**
```markdown
**Incident Started**: [time]
**Severity**: [SEV1-4]
**Impact**: [what's broken, who's affected]
**Status**: Investigating
**Next Update**: [time]
```

### 3. Mitigate (Priority #1)

**Goal: Restore service, not fix root cause**

Common mitigations:
```bash
# Rollback to last known good
git revert [commit] && deploy

# Scale up resources
kubectl scale deployment/api --replicas=10

# Toggle feature flag
disable_feature('broken_feature')

# Redirect traffic
# Route away from broken service

# Clear cache
redis-cli FLUSHALL
```

### 4. Investigate

**Only after mitigation or in parallel**

```bash
# Check recent deployments
git log --oneline -10

# Check error rates
# [monitoring dashboard]

# Check logs
kubectl logs deployment/api --since=1h | grep ERROR

# Check metrics
# CPU, memory, latency, error rates

# Check dependencies
# Database, external APIs, caches
```

### 5. Resolve

Once root cause is found:
- Implement proper fix (if different from mitigation)
- Test fix thoroughly
- Deploy with monitoring

### 6. Post-Incident

**Within 24-48 hours:**

```markdown
## Incident Postmortem

**Date**: [date]
**Duration**: [start] - [end]
**Severity**: [SEV1-4]
**Author**: [name]

### Summary
[1-2 sentence description]

### Impact
- [Number] users affected
- [Duration] of degraded service
- [Any data loss or business impact]

### Timeline
- [time] - First alert
- [time] - Team engaged
- [time] - Root cause identified
- [time] - Mitigation applied
- [time] - Service restored

### Root Cause
[Technical explanation of what went wrong]

### Contributing Factors
- [Factor 1]
- [Factor 2]

### What Went Well
- [Good response actions]

### What Could Be Improved
- [Areas for improvement]

### Action Items
- [ ] [Action] - Owner: [name] - Due: [date]
- [ ] [Action] - Owner: [name] - Due: [date]
```

## Incident Roles

| Role | Responsibility |
|------|---------------|
| **Incident Commander** | Coordinates response, makes decisions |
| **Tech Lead** | Leads technical investigation |
| **Communications** | Updates stakeholders |
| **Scribe** | Documents timeline and actions |

## Communication Guidelines

### During Incident
- Update every 15-30 minutes
- Be factual, not speculative
- Include next update time

### To Stakeholders
```markdown
**Status Update - [time]**

Current Status: [investigating/mitigating/resolved]

What we know:
- [fact 1]
- [fact 2]

What we're doing:
- [action 1]

Next update: [time]
```

## Quick Reference Commands

```bash
# Check pod status
kubectl get pods -n production

# Get recent logs
kubectl logs deployment/api --tail=100

# Check database connections
psql -c "SELECT count(*) FROM pg_stat_activity"

# Check recent deploys
kubectl rollout history deployment/api

# Rollback deployment
kubectl rollout undo deployment/api

# Scale up
kubectl scale deployment/api --replicas=10
```
