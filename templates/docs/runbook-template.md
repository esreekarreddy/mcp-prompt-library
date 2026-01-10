# Runbook Template

> Operational Runbook for [Service/System Name]

**Last Updated**: [Date]  
**Owner**: [Team/Person]  
**On-Call**: [Link to on-call schedule]

---

## Service Overview

**Service Name**: [Name]  
**Description**: [What this service does]  
**Dependencies**: [List critical dependencies]  
**Repository**: [Link to repo]  
**Dashboard**: [Link to monitoring dashboard]  
**Logs**: [Link to log aggregator]

---

## Quick Reference

| Action | Command/Link |
|--------|-------------|
| Check health | `curl https://service.com/health` |
| View logs | [Link to logs] |
| View metrics | [Link to dashboard] |
| Deploy | `npm run deploy` |
| Rollback | `npm run rollback` |

---

## Architecture

```
[Simple architecture diagram or description]

User → Load Balancer → Service → Database
                         ↓
                      Cache
```

---

## Common Issues and Resolutions

### Issue 1: [High Latency]

**Symptoms:**
- Response times > 500ms
- Dashboard shows latency spike

**Diagnosis:**
```bash
# Check current latency
curl -w "@curl-format.txt" https://service.com/health

# Check database connections
[command to check db]
```

**Resolution:**
1. Check database load
2. Check cache hit rate
3. If overloaded, scale horizontally: `[scaling command]`
4. If cache miss, restart cache: `[restart command]`

**Escalation**: If unresolved after 15 minutes, escalate to [team/person]

---

### Issue 2: [Service Unavailable]

**Symptoms:**
- 5xx errors
- Health check failing

**Diagnosis:**
```bash
# Check pod/container status
kubectl get pods -n [namespace]

# Check recent logs
kubectl logs -n [namespace] [pod-name] --tail=100
```

**Resolution:**
1. Check recent deployments - rollback if needed
2. Check dependencies (database, external APIs)
3. Restart service: `kubectl rollout restart deployment/[name]`

---

### Issue 3: [Database Connection Issues]

**Symptoms:**
- Connection timeout errors in logs
- Queries timing out

**Diagnosis:**
```bash
# Check connection pool
[command]

# Check database status
[command]
```

**Resolution:**
1. Check database health
2. Check connection pool limits
3. Restart connection pool: `[command]`

---

## Alerts

| Alert | Severity | Meaning | Action |
|-------|----------|---------|--------|
| HighLatency | Warning | p95 > 500ms | Check Issue 1 |
| ServiceDown | Critical | Health check failing | Check Issue 2 |
| ErrorRateHigh | Critical | Error rate > 5% | Check logs |
| DiskSpaceLow | Warning | Disk > 80% | Clear old logs |

---

## Deployment

### Standard Deployment

```bash
# 1. Run tests
npm test

# 2. Build
npm run build

# 3. Deploy to staging
npm run deploy:staging

# 4. Verify staging
curl https://staging.service.com/health

# 5. Deploy to production
npm run deploy:production

# 6. Verify production
curl https://service.com/health
```

### Rollback

```bash
# Immediate rollback to previous version
npm run rollback

# Or specific version
npm run rollback -- --version=1.2.3
```

---

## Scaling

### Horizontal Scaling

```bash
# Scale to N replicas
kubectl scale deployment/[name] --replicas=N

# Or auto-scale
kubectl autoscale deployment/[name] --min=2 --max=10 --cpu-percent=70
```

### When to Scale
- CPU usage sustained > 70%
- Latency increasing despite healthy pods
- Scheduled high-traffic events

---

## Maintenance

### Database Migrations

```bash
# Run pending migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback
```

### Log Rotation

Logs are rotated automatically every 7 days. If disk space is critical:
```bash
# Clear old logs manually
[command]
```

---

## Contacts

| Role | Contact | When |
|------|---------|------|
| Primary On-Call | [Link to schedule] | First response |
| Engineering Lead | [Name/Contact] | Escalation |
| Database Admin | [Name/Contact] | Database issues |
| Security | [Name/Contact] | Security incidents |

---

## Appendix

### Useful Commands

```bash
# Check service health
curl https://service.com/health

# Watch logs
kubectl logs -f deployment/[name]

# Get pod details
kubectl describe pod [pod-name]

# Port forward for local debugging
kubectl port-forward service/[name] 8080:80
```

### Related Documentation

- [Architecture Doc](../architecture/SERVICE_NAME.md) <!-- Update with actual path -->
- [API Documentation](../api/SERVICE_NAME.md) <!-- Update with actual path -->
- [Incident History](../incidents/SERVICE_NAME.md) <!-- Update with actual path -->
