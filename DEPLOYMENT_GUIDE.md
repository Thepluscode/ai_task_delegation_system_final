# 🚀 **DEPLOYMENT GUIDE**
## AI Automation Platform - Production Deployment

---

## 📋 **OVERVIEW**

This guide provides comprehensive instructions for deploying the AI Automation Platform in production environments. The platform supports multiple deployment strategies including Docker Compose, Kubernetes, and cloud-native deployments.

### **Architecture Overview**
- **Frontend**: Next.js application with React components
- **Backend Services**: Microservices architecture with Python FastAPI
- **Databases**: PostgreSQL, Redis, InfluxDB, Elasticsearch
- **Message Queue**: RabbitMQ for async communication
- **Monitoring**: Prometheus, Grafana, and custom dashboards
- **Load Balancing**: Nginx with SSL termination

---

## 🔧 **PREREQUISITES**

### **System Requirements**
- **CPU**: Minimum 8 cores, Recommended 16+ cores
- **Memory**: Minimum 16GB RAM, Recommended 32GB+ RAM
- **Storage**: Minimum 100GB SSD, Recommended 500GB+ SSD
- **Network**: Stable internet connection with 1Gbps+ bandwidth

### **Software Requirements**
- **Docker**: Version 24.0+ with Docker Compose v2
- **Kubernetes**: Version 1.28+ (for K8s deployment)
- **Node.js**: Version 18+ (for local development)
- **Python**: Version 3.11+ (for backend services)
- **Git**: Latest version for source code management

### **Cloud Provider Requirements**
- **AWS**: EKS, RDS, ElastiCache, S3, CloudWatch
- **Azure**: AKS, Azure Database, Redis Cache, Blob Storage
- **GCP**: GKE, Cloud SQL, Memorystore, Cloud Storage

---

## 🐳 **DOCKER DEPLOYMENT**

### **Quick Start with Docker Compose**

1. **Clone the Repository**
```bash
git clone https://github.com/your-org/ai-automation-platform.git
cd ai-automation-platform
```

2. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

3. **Build and Start Services**
```bash
# Build all services
docker-compose build

# Start the platform
docker-compose up -d

# Check service status
docker-compose ps
```

4. **Initialize Database**
```bash
# Run database migrations
docker-compose exec task-delegation-service python manage.py migrate

# Create admin user
docker-compose exec task-delegation-service python manage.py createsuperuser
```

5. **Access the Platform**
- **Frontend**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **Grafana**: http://localhost:3001 (admin/automation_grafana_pass)
- **Prometheus**: http://localhost:9090

### **Production Docker Configuration**

1. **SSL Certificate Setup**
```bash
# Generate SSL certificates
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/automation-platform.key \
  -out nginx/ssl/automation-platform.crt
```

2. **Environment Variables**
```bash
# Production environment file
cat > .env.production << EOF
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@postgres:5432/automation_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secure-jwt-secret
ENCRYPTION_KEY=your-32-character-encryption-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
EOF
```

3. **Production Deployment**
```bash
# Deploy with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Monitor logs
docker-compose logs -f
```

---

## ☸️ **KUBERNETES DEPLOYMENT**

### **Prerequisites**
- Kubernetes cluster (EKS, AKS, GKE, or on-premises)
- kubectl configured with cluster access
- Helm 3.x installed
- Container registry access (ECR, ACR, GCR, or Docker Hub)

### **1. Prepare Container Images**

```bash
# Build and tag images
docker build -t your-registry/automation-frontend:v1.0.0 .
docker build -t your-registry/automation-backend:v1.0.0 ./services/task-delegation-service

# Push to registry
docker push your-registry/automation-frontend:v1.0.0
docker push your-registry/automation-backend:v1.0.0
```

### **2. Deploy Infrastructure**

```bash
# Create namespace and secrets
kubectl apply -f k8s/namespace.yaml

# Deploy databases
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/elasticsearch-deployment.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n automation-platform --timeout=300s
```

### **3. Deploy Application Services**

```bash
# Deploy backend services
kubectl apply -f k8s/task-delegation-deployment.yaml
kubectl apply -f k8s/robot-control-deployment.yaml
kubectl apply -f k8s/workflow-engine-deployment.yaml
kubectl apply -f k8s/analytics-deployment.yaml
kubectl apply -f k8s/learning-service-deployment.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml

# Deploy ingress
kubectl apply -f k8s/ingress.yaml
```

### **4. Configure Monitoring**

```bash
# Deploy Prometheus and Grafana
kubectl apply -f k8s/monitoring/

# Access Grafana dashboard
kubectl port-forward svc/grafana-service 3000:80 -n automation-platform
```

### **5. Verify Deployment**

```bash
# Check all pods are running
kubectl get pods -n automation-platform

# Check services
kubectl get svc -n automation-platform

# Check ingress
kubectl get ingress -n automation-platform

# View logs
kubectl logs -f deployment/frontend-deployment -n automation-platform
```

---

## ☁️ **CLOUD DEPLOYMENT**

### **AWS Deployment with EKS**

1. **Create EKS Cluster**
```bash
# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin

# Create cluster
eksctl create cluster \
  --name automation-platform \
  --version 1.28 \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type m5.xlarge \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 10 \
  --managed
```

2. **Configure RDS and ElastiCache**
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier automation-db \
  --db-instance-class db.r5.large \
  --engine postgres \
  --master-username automation_user \
  --master-user-password your-secure-password \
  --allocated-storage 100 \
  --vpc-security-group-ids sg-xxxxxxxxx

# Create ElastiCache cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id automation-redis \
  --cache-node-type cache.r5.large \
  --engine redis \
  --num-cache-nodes 1
```

3. **Deploy Application**
```bash
# Update Kubernetes configs with AWS resources
# Deploy using kubectl as described in K8s section
```

### **Azure Deployment with AKS**

1. **Create AKS Cluster**
```bash
# Create resource group
az group create --name automation-platform-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group automation-platform-rg \
  --name automation-platform-aks \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group automation-platform-rg --name automation-platform-aks
```

2. **Configure Azure Database and Redis**
```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group automation-platform-rg \
  --name automation-postgres \
  --location eastus \
  --admin-user automation_user \
  --admin-password your-secure-password \
  --sku-name GP_Gen5_2

# Create Redis cache
az redis create \
  --resource-group automation-platform-rg \
  --name automation-redis \
  --location eastus \
  --sku Standard \
  --vm-size c1
```

### **GCP Deployment with GKE**

1. **Create GKE Cluster**
```bash
# Set project and zone
gcloud config set project your-project-id
gcloud config set compute/zone us-central1-a

# Create cluster
gcloud container clusters create automation-platform \
  --num-nodes 3 \
  --machine-type n1-standard-4 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10

# Get credentials
gcloud container clusters get-credentials automation-platform
```

2. **Configure Cloud SQL and Memorystore**
```bash
# Create Cloud SQL instance
gcloud sql instances create automation-postgres \
  --database-version POSTGRES_13 \
  --tier db-n1-standard-2 \
  --region us-central1

# Create Memorystore Redis instance
gcloud redis instances create automation-redis \
  --size 1 \
  --region us-central1 \
  --redis-version redis_6_x
```

---

## 🔒 **SECURITY CONFIGURATION**

### **SSL/TLS Setup**

1. **Certificate Management**
```bash
# Using Let's Encrypt with cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
kubectl apply -f k8s/cert-manager/cluster-issuer.yaml
```

2. **Network Policies**
```bash
# Apply network policies
kubectl apply -f k8s/security/network-policies.yaml
```

### **Authentication and Authorization**

1. **OAuth2 Configuration**
```yaml
# Configure OAuth2 providers in environment
OAUTH2_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH2_GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH2_MICROSOFT_CLIENT_ID=your-microsoft-client-id
OAUTH2_MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

2. **RBAC Setup**
```bash
# Apply RBAC configurations
kubectl apply -f k8s/security/rbac.yaml
```

---

## 📊 **MONITORING AND LOGGING**

### **Prometheus and Grafana Setup**

1. **Deploy Monitoring Stack**
```bash
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --values monitoring/prometheus-values.yaml
```

2. **Custom Dashboards**
```bash
# Import custom Grafana dashboards
kubectl apply -f monitoring/grafana/dashboards/
```

### **Centralized Logging**

1. **ELK Stack Deployment**
```bash
# Deploy Elasticsearch, Logstash, and Kibana
kubectl apply -f k8s/logging/elasticsearch.yaml
kubectl apply -f k8s/logging/logstash.yaml
kubectl apply -f k8s/logging/kibana.yaml
```

2. **Log Aggregation**
```bash
# Deploy Fluentd for log collection
kubectl apply -f k8s/logging/fluentd.yaml
```

---

## 🔧 **MAINTENANCE AND UPDATES**

### **Backup Procedures**

1. **Database Backups**
```bash
# PostgreSQL backup
kubectl exec -it postgres-pod -- pg_dump -U automation_user automation_db > backup.sql

# Redis backup
kubectl exec -it redis-pod -- redis-cli BGSAVE
```

2. **Configuration Backups**
```bash
# Backup Kubernetes configurations
kubectl get all -n automation-platform -o yaml > k8s-backup.yaml
```

### **Rolling Updates**

1. **Update Application**
```bash
# Update image version
kubectl set image deployment/frontend-deployment frontend=your-registry/automation-frontend:v1.1.0 -n automation-platform

# Monitor rollout
kubectl rollout status deployment/frontend-deployment -n automation-platform
```

2. **Rollback if Needed**
```bash
# Rollback to previous version
kubectl rollout undo deployment/frontend-deployment -n automation-platform
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

1. **Pod Startup Issues**
```bash
# Check pod status
kubectl describe pod <pod-name> -n automation-platform

# View logs
kubectl logs <pod-name> -n automation-platform --previous
```

2. **Database Connection Issues**
```bash
# Test database connectivity
kubectl exec -it <app-pod> -- nc -zv postgres-service 5432

# Check database logs
kubectl logs postgres-deployment-xxx -n automation-platform
```

3. **Performance Issues**
```bash
# Check resource usage
kubectl top pods -n automation-platform
kubectl top nodes

# Scale up if needed
kubectl scale deployment frontend-deployment --replicas=5 -n automation-platform
```

### **Health Checks**

1. **Application Health**
```bash
# Check all endpoints
curl -f http://your-domain.com/api/health
curl -f http://your-domain.com/api/tasks/health
curl -f http://your-domain.com/api/robots/health
```

2. **Infrastructure Health**
```bash
# Check cluster health
kubectl get nodes
kubectl get pods --all-namespaces
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## 📞 **SUPPORT**

### **Getting Help**
- **Documentation**: https://docs.automation-platform.com
- **Support Email**: support@automation-platform.com
- **Community Forum**: https://community.automation-platform.com
- **Emergency Support**: +1-800-AUTOMATION

### **Monitoring Alerts**
- **Slack Integration**: Configure alerts to Slack channels
- **Email Notifications**: Set up email alerts for critical issues
- **PagerDuty**: Integrate with PagerDuty for 24/7 monitoring

---

## 🎉 **CONCLUSION**

This deployment guide provides comprehensive instructions for deploying the AI Automation Platform in production environments. Follow the appropriate section based on your deployment strategy and infrastructure requirements.

For additional support or custom deployment requirements, please contact our professional services team.
