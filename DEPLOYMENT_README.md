# 🚀 AI Task Delegation System - Deployment Guide

## Overview

The AI Task Delegation System is a comprehensive microservices architecture designed for intelligent task routing, workflow management, and real-time decision making. This deployment guide covers all aspects of setting up and running the complete system.

## 🏗️ System Architecture

### Core Services

| Service | Port | Description |
|---------|------|-------------|
| **Agent Selection Service** | 8001 | Intelligent agent selection and task routing |
| **Robot Abstraction Service** | 8002 | Universal robot control and abstraction layer |
| **Workflow State Service** | 8003 | Hierarchical workflow management with event sourcing |
| **Learning Service** | 8004 | Adaptive learning and performance optimization |
| **Banking Adapter** | 8006 | Banking transaction processing and learning |
| **Dashboard API** | 8007 | Centralized API for dashboard data |
| **Edge Computing Service** | 8008 | Sub-10ms real-time decisions with computer vision |

### Frontend Dashboard

| Component | Port | Description |
|-----------|------|-------------|
| **Next.js Dashboard** | 3000 | Comprehensive monitoring and control interface |

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Clone and navigate to the project
cd ai_task_delegation_system_final

# Run the deployment script
./deploy_core_system.sh
```

### 2. Start All Services

```bash
# Start all backend services
./start_core_services.sh

# Start the frontend dashboard (in a new terminal)
cd automation-ai-next
npm install
npm run dev
```

### 3. Verify Deployment

```bash
# Check service health
./check_services_health.sh

# View comprehensive status
./system_status.sh
```

### 4. Access the System

- **Main Dashboard**: http://localhost:3000
- **Service APIs**: http://localhost:800X (where X is the service port)

## 📋 Detailed Deployment Steps

### Prerequisites

- Python 3.11+
- Node.js 18+
- Virtual environment activated
- PostgreSQL (optional, for production)
- Redis (optional, for caching)

### Backend Services Deployment

1. **Environment Setup**
   ```bash
   # Activate virtual environment
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Service Configuration**
   ```bash
   # Development configuration
   cp config/dev/services.yaml config/services.yaml
   
   # Production configuration (if needed)
   cp config/prod/services.yaml config/services.yaml
   ```

3. **Start Services**
   ```bash
   # Start all services
   ./start_core_services.sh
   
   # Or start individual services
   python services/agent-selection-service/src/main.py
   python services/robot-abstraction-service/src/main.py
   # ... etc
   ```

### Frontend Dashboard Deployment

1. **Install Dependencies**
   ```bash
   cd automation-ai-next
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure service URLs
   NEXT_PUBLIC_AGENT_SELECTION_URL=http://localhost:8001
   NEXT_PUBLIC_ROBOT_ABSTRACTION_URL=http://localhost:8002
   NEXT_PUBLIC_WORKFLOW_STATE_URL=http://localhost:8003
   NEXT_PUBLIC_EDGE_COMPUTING_URL=http://localhost:8008
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Service Containers

```bash
# Build the image
docker build -t ai-task-delegation .

# Run specific service
docker run -p 8001:8001 -e SERVICE_NAME=agent-selection ai-task-delegation
```

## 🔧 Service Management

### Starting Services

```bash
# Start all services
./start_core_services.sh

# Start specific service
./restart_service.sh agent-selection
```

### Stopping Services

```bash
# Stop all services
./stop_core_services.sh

# Stop specific service (kill PID from logs/service-name.pid)
kill $(cat logs/agent-selection.pid)
```

### Health Monitoring

```bash
# Quick health check
./check_services_health.sh

# Comprehensive status
./system_status.sh

# Continuous monitoring
watch -n 30 ./system_status.sh
```

### Log Management

```bash
# View all logs
tail -f logs/*.log

# View specific service log
tail -f logs/agent-selection.log

# View error logs only
grep -i error logs/*.log
```

## 📊 Dashboard Features

### Core Dashboards

1. **Agent Selection Dashboard**
   - Agent performance metrics
   - Task routing analytics
   - Real-time agent status

2. **Robot Abstraction Dashboard**
   - Multi-brand robot control
   - Universal command interface
   - Robot status monitoring

3. **Workflow Management Dashboard**
   - Hierarchical workflow visualization
   - Event sourcing timeline
   - State machine monitoring

4. **Edge Computing Dashboard**
   - Sub-10ms decision tracking
   - Computer vision processing
   - Real-time performance metrics

### Advanced Features

- **Real-time Updates**: WebSocket connections for live data
- **Interactive Controls**: Start, stop, and configure services
- **Performance Analytics**: Comprehensive metrics and insights
- **Error Monitoring**: Real-time error tracking and alerts

## 🔍 Troubleshooting

### Common Issues

1. **Service Won't Start**
   ```bash
   # Check if port is already in use
   netstat -ln | grep :8001
   
   # Check service logs
   tail -f logs/agent-selection.log
   
   # Restart service
   ./restart_service.sh agent-selection
   ```

2. **Frontend Not Loading**
   ```bash
   # Check if backend services are running
   ./check_services_health.sh
   
   # Restart frontend
   cd automation-ai-next
   npm run dev
   ```

3. **Database Connection Issues**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   
   # Check Redis status
   redis-cli ping
   ```

### Performance Optimization

1. **Memory Usage**
   ```bash
   # Monitor memory usage
   free -h
   
   # Check service memory usage
   ps aux | grep python | awk '{print $4, $11}'
   ```

2. **CPU Usage**
   ```bash
   # Monitor CPU usage
   top -p $(pgrep -d',' python)
   ```

3. **Network Performance**
   ```bash
   # Check network connections
   netstat -an | grep :800
   
   # Test service response times
   curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8001/health
   ```

## 🔒 Security Considerations

### Development Environment

- Services run on localhost only
- No authentication required for development
- CORS enabled for frontend development

### Production Environment

- Configure proper authentication
- Use HTTPS for all communications
- Implement rate limiting
- Set up proper firewall rules
- Use environment variables for secrets

## 📈 Monitoring and Metrics

### Built-in Monitoring

- Health check endpoints on all services
- Performance metrics collection
- Real-time status dashboard
- Automated error detection

### External Monitoring

- Prometheus metrics (optional)
- Grafana dashboards (optional)
- Log aggregation with ELK stack (optional)

## 🔄 Updates and Maintenance

### Updating Services

```bash
# Pull latest changes
git pull origin main

# Restart services
./stop_core_services.sh
./start_core_services.sh
```

### Database Migrations

```bash
# Run database migrations (if applicable)
alembic upgrade head
```

### Backup and Recovery

```bash
# Backup logs
tar -czf backup-$(date +%Y%m%d).tar.gz logs/

# Backup configuration
cp -r config/ backup-config-$(date +%Y%m%d)/
```

## 🆘 Support

### Getting Help

1. Check the logs: `tail -f logs/*.log`
2. Run health check: `./check_services_health.sh`
3. View system status: `./system_status.sh`
4. Check documentation in `docs/` directory

### Reporting Issues

When reporting issues, please include:
- Output of `./system_status.sh`
- Relevant log files from `logs/`
- Steps to reproduce the issue
- Expected vs actual behavior

## 🎯 Next Steps

After successful deployment:

1. **Explore the Dashboard**: Visit http://localhost:3000
2. **Test Core Features**: Try agent selection, workflow management, edge computing
3. **Monitor Performance**: Use the built-in monitoring tools
4. **Customize Configuration**: Modify settings in `config/` directory
5. **Scale Services**: Use Docker Compose for production deployment

---

**🚀 Your AI Task Delegation System is now ready for intelligent task management!**
