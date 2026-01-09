# Chain: Production Launch

> Complete checklist and workflow for launching to production

## Overview

```
Review → Test → Prepare → Deploy → Verify → Monitor
```

---

## Step 1: Code & Security Review

**Prompt:**
```
Production readiness review. Check:

## Code Quality
- All tests passing?
- No console.logs or debug code?
- Error handling complete?
- Logging appropriate?

## Security
- Auth on all sensitive routes?
- Input validation everywhere?
- No hardcoded secrets?
- Security headers configured?

## Performance
- Database queries optimized?
- Caching where needed?
- Assets optimized?

For each area: ✅ Good, ⚠️ Needs attention, ❌ Blocking issue
```

**Expected Output:**
- Checklist with status
- Blocking issues identified
- Warnings noted

**Decision Point:** Fix any blocking issues before proceeding.

---

## Step 2: Environment Verification

**Prompt:**
```
Verify production environment:

## Configuration
- Environment variables set?
- Different from development?
- .env.example up to date?
- Secrets in secure storage?

## Infrastructure
- Database provisioned and migrated?
- CDN configured?
- SSL certificates valid?
- DNS configured?

## Monitoring
- Error tracking set up?
- Performance monitoring ready?
- Uptime monitoring configured?
- Alerts set up?

List anything missing or misconfigured.
```

**Expected Output:**
- Environment checklist
- Missing configurations
- Setup instructions

---

## Step 3: Pre-Launch Testing

**Prompt:**
```
Run pre-launch tests:

## Functional
- Critical user paths work?
- Edge cases handled?
- Error states display correctly?

## Performance
- Page load times acceptable?
- API response times good?
- No memory leaks?

## Security
- Can't access others' data?
- Rate limiting works?
- Auth flows secure?

## Compatibility
- Works on target browsers?
- Mobile responsive?
- Accessibility basics?

Test in staging environment. Report any issues.
```

**Expected Output:**
- Test results
- Issues found
- Blockers vs. known issues

**Decision Point:** All blockers resolved?

---

## Step 4: Deployment Preparation

**Prompt:**
```
Prepare for deployment:

## Deployment Plan
1. What's the deployment process?
2. What order (database first, etc.)?
3. Zero downtime or maintenance window?
4. Feature flags to enable?

## Rollback Plan
1. How do we rollback?
2. How quickly can we rollback?
3. What triggers a rollback?
4. Who has authority to rollback?

## Communication
1. Who needs to know?
2. Status page update needed?
3. Support team briefed?

Document the plan.
```

**Expected Output:**
- Step-by-step deployment plan
- Rollback procedure
- Communication plan

---

## Step 5: Execute Deployment

**Prompt:**
```
Execute deployment:

## Pre-Deployment
- [ ] Notify relevant teams
- [ ] Ensure rollback is ready
- [ ] Have monitoring open

## Deployment
[Execute deployment commands]

## Immediate Verification
- [ ] Application starts
- [ ] Health check passes
- [ ] No immediate errors
- [ ] Basic functionality works

Report status after each step.
```

**Expected Output:**
- Deployment log
- Verification results
- Any issues encountered

---

## Step 6: Post-Deployment Verification

**Prompt:**
```
Verify deployment success:

## Smoke Tests
- [ ] Home page loads
- [ ] User can log in
- [ ] Critical features work
- [ ] API endpoints respond

## Monitoring Check
- [ ] Error rate normal
- [ ] Latency normal
- [ ] No new error types
- [ ] Resource usage normal

## User Verification
- [ ] Test with real account
- [ ] Complete a full user flow
- [ ] Check on mobile

Duration: Monitor for at least 30 minutes before declaring success.
```

**Expected Output:**
- Verification checklist
- Monitoring snapshots
- Any issues found

---

## Step 7: Post-Launch

**Prompt:**
```
Post-launch activities:

## Documentation
- [ ] Update changelog
- [ ] Update user documentation
- [ ] Internal docs current

## Communication
- [ ] Announce to stakeholders
- [ ] Update status page
- [ ] Notify support team

## Monitoring Plan
- [ ] Who's monitoring for next 24 hours?
- [ ] When is first check-in?
- [ ] Escalation path defined?

## Retrospective
- [ ] What went well?
- [ ] What could improve?
- [ ] Action items for next launch?
```

**Expected Output:**
- Launch announcement
- Monitoring schedule
- Lessons learned

---

## Chain Summary

| Step | Focus | Output |
|------|-------|--------|
| 1 | Review | Code/security check |
| 2 | Environment | Config verification |
| 3 | Test | Pre-launch testing |
| 4 | Prepare | Deployment plan |
| 5 | Deploy | Execution |
| 6 | Verify | Confirmation |
| 7 | Complete | Documentation |

## Launch Day Checklist

### Before Launch
- [ ] All blockers resolved
- [ ] Tests passing
- [ ] Environment configured
- [ ] Team available
- [ ] Rollback ready

### During Launch
- [ ] Follow deployment plan
- [ ] Monitor for errors
- [ ] Verify each step
- [ ] Communicate status

### After Launch
- [ ] Smoke tests pass
- [ ] Monitoring normal
- [ ] Document issues
- [ ] Celebrate! 🎉

## Rollback Triggers

| Trigger | Action |
|---------|--------|
| Error rate > 5% | Investigate, consider rollback |
| Error rate > 10% | Rollback immediately |
| Critical feature broken | Rollback immediately |
| Data corruption | Rollback immediately |
| Security issue | Rollback immediately |
