# Kubernetes Deployment

These manifests deploy Resolve to a Kubernetes cluster. They are provided
to demonstrate production-grade deployment awareness. The application is
currently deployed on Railway — these manifests reflect how it would be
deployed in a Capitec-style AWS/EKS environment.

## Prerequisites

- kubectl configured against your cluster
- A container registry (ECR, GCR, etc.) with built images

## Setup

### 1. Create the secrets

Replace the placeholder values with your actual credentials:

```bash
kubectl create secret generic resolve-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@postgres:5432/disputes_db" \
  --from-literal=JWT_ACCESS_SECRET="your-access-secret" \
  --from-literal=JWT_REFRESH_SECRET="your-refresh-secret" \
  --from-literal=CLIENT_ORIGIN="https://your-frontend-domain.com" \
  --from-literal=POSTGRES_USER="postgres" \
  --from-literal=POSTGRES_PASSWORD="your-db-password"
```

### 2. Update image references

In `backend-deployment.yaml` and `frontend-deployment.yaml`, replace
`your-registry/resolve-backend:latest` and `your-registry/resolve-frontend:latest`
with your actual image URIs from your container registry.

### 3. Apply manifests in order

```bash
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

### 4. Verify deployments

```bash
kubectl get pods
kubectl get services
```

The frontend service is exposed as a LoadBalancer. Use the external IP to access the app.

## Architecture on Kubernetes

```
Internet
    │
    ▼
LoadBalancer (resolve-frontend :80)
    │
    ▼
Frontend Pods (nginx, 2 replicas)
    │  proxies /api/ requests
    ▼
ClusterIP (resolve-backend :4000)
    │
    ▼
Backend Pods (Node.js)
    │
    ▼
StatefulSet (postgres :5432)
    │
    ▼
PersistentVolumeClaim (5Gi)
```

## Design decisions

- **StatefulSet for Postgres** — ensures stable network identity and ordered pod management, required for databases
- **2 replicas for frontend** — stateless nginx, safe to scale horizontally
- **1 replica for backend** — can be scaled horizontally; session state is in JWT tokens, not server memory
- **Secrets via kubectl secret** — never committed to git; in production these would be managed by AWS Secrets Manager or Vault
- **Resource limits** — prevents any single pod from consuming disproportionate cluster resources
- **Health checks** — readiness and liveness probes on both frontend and backend ensure traffic only routes to healthy pods
