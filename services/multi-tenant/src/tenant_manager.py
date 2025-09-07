"""
Multi-Tenant Architecture & Enterprise Scaling
Comprehensive tenant management, data isolation, and scalable infrastructure
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, asdict
from enum import Enum
import hashlib
import secrets
from sqlalchemy import create_engine, text, MetaData, Table, Column, String, DateTime, Boolean, Integer, Float, JSON
from sqlalchemy.orm import sessionmaker
import redis
import boto3
from kubernetes import client, config

logger = logging.getLogger(__name__)

class TenantTier(Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"

class TenantStatus(Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TRIAL = "trial"
    EXPIRED = "expired"
    PENDING = "pending"

class ResourceType(Enum):
    CPU = "cpu"
    MEMORY = "memory"
    STORAGE = "storage"
    BANDWIDTH = "bandwidth"
    API_CALLS = "api_calls"
    ROBOTS = "robots"
    USERS = "users"
    WORKFLOWS = "workflows"

@dataclass
class ResourceQuota:
    resource_type: ResourceType
    limit: float
    used: float = 0.0
    unit: str = ""
    
    def is_exceeded(self) -> bool:
        return self.used >= self.limit
    
    def usage_percentage(self) -> float:
        return (self.used / self.limit) * 100 if self.limit > 0 else 0

@dataclass
class TenantConfiguration:
    tenant_id: str
    name: str
    domain: str
    tier: TenantTier
    status: TenantStatus
    admin_email: str
    created_at: datetime
    expires_at: Optional[datetime]
    resource_quotas: Dict[ResourceType, ResourceQuota]
    features: Set[str]
    custom_branding: Dict[str, Any]
    database_config: Dict[str, str]
    storage_config: Dict[str, str]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class TenantUsageMetrics:
    tenant_id: str
    timestamp: datetime
    resource_usage: Dict[ResourceType, float]
    active_users: int
    api_requests: int
    storage_used: float
    bandwidth_used: float
    cost_estimate: float

class DatabaseManager:
    """Multi-tenant database management with data isolation"""
    
    def __init__(self, master_db_url: str):
        self.master_engine = create_engine(master_db_url)
        self.tenant_engines = {}
        self.metadata = MetaData()
        
        # Define tenant metadata table
        self.tenants_table = Table(
            'tenants',
            self.metadata,
            Column('tenant_id', String(50), primary_key=True),
            Column('name', String(255), nullable=False),
            Column('domain', String(255), unique=True, nullable=False),
            Column('tier', String(50), nullable=False),
            Column('status', String(50), nullable=False),
            Column('admin_email', String(255), nullable=False),
            Column('created_at', DateTime, nullable=False),
            Column('expires_at', DateTime),
            Column('database_url', String(500), nullable=False),
            Column('configuration', JSON),
            Column('metadata', JSON)
        )
        
        # Create tables
        self.metadata.create_all(self.master_engine)
    
    async def create_tenant_database(self, tenant_config: TenantConfiguration) -> str:
        """Create isolated database for tenant"""
        # Generate unique database name
        db_name = f"tenant_{tenant_config.tenant_id.replace('-', '_')}"
        
        # Create database
        with self.master_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE {db_name}"))
            conn.commit()
        
        # Create tenant-specific connection string
        master_url = str(self.master_engine.url)
        tenant_db_url = master_url.replace(master_url.split('/')[-1], db_name)
        
        # Create tenant engine
        tenant_engine = create_engine(tenant_db_url)
        self.tenant_engines[tenant_config.tenant_id] = tenant_engine
        
        # Initialize tenant schema
        await self._initialize_tenant_schema(tenant_engine)
        
        # Store tenant configuration
        await self._store_tenant_config(tenant_config, tenant_db_url)
        
        logger.info(f"Created database for tenant: {tenant_config.name}")
        return tenant_db_url
    
    async def _initialize_tenant_schema(self, tenant_engine):
        """Initialize schema for tenant database"""
        tenant_metadata = MetaData()
        
        # Define tenant-specific tables
        users_table = Table(
            'users',
            tenant_metadata,
            Column('user_id', String(50), primary_key=True),
            Column('username', String(100), unique=True, nullable=False),
            Column('email', String(255), unique=True, nullable=False),
            Column('created_at', DateTime, nullable=False),
            Column('last_login', DateTime),
            Column('metadata', JSON)
        )
        
        robots_table = Table(
            'robots',
            tenant_metadata,
            Column('robot_id', String(50), primary_key=True),
            Column('name', String(255), nullable=False),
            Column('type', String(100), nullable=False),
            Column('status', String(50), nullable=False),
            Column('location', String(255)),
            Column('created_at', DateTime, nullable=False),
            Column('configuration', JSON),
            Column('metadata', JSON)
        )
        
        tasks_table = Table(
            'tasks',
            tenant_metadata,
            Column('task_id', String(50), primary_key=True),
            Column('title', String(255), nullable=False),
            Column('description', String(1000)),
            Column('status', String(50), nullable=False),
            Column('priority', String(50), nullable=False),
            Column('assigned_to', String(50)),
            Column('created_at', DateTime, nullable=False),
            Column('completed_at', DateTime),
            Column('metadata', JSON)
        )
        
        workflows_table = Table(
            'workflows',
            tenant_metadata,
            Column('workflow_id', String(50), primary_key=True),
            Column('name', String(255), nullable=False),
            Column('description', String(1000)),
            Column('definition', JSON, nullable=False),
            Column('status', String(50), nullable=False),
            Column('created_by', String(50), nullable=False),
            Column('created_at', DateTime, nullable=False),
            Column('metadata', JSON)
        )
        
        # Create all tables
        tenant_metadata.create_all(tenant_engine)
    
    async def _store_tenant_config(self, tenant_config: TenantConfiguration, db_url: str):
        """Store tenant configuration in master database"""
        with self.master_engine.connect() as conn:
            conn.execute(
                self.tenants_table.insert().values(
                    tenant_id=tenant_config.tenant_id,
                    name=tenant_config.name,
                    domain=tenant_config.domain,
                    tier=tenant_config.tier.value,
                    status=tenant_config.status.value,
                    admin_email=tenant_config.admin_email,
                    created_at=tenant_config.created_at,
                    expires_at=tenant_config.expires_at,
                    database_url=db_url,
                    configuration=json.dumps({
                        'resource_quotas': {k.value: asdict(v) for k, v in tenant_config.resource_quotas.items()},
                        'features': list(tenant_config.features),
                        'custom_branding': tenant_config.custom_branding
                    }),
                    metadata=json.dumps(tenant_config.metadata)
                )
            )
            conn.commit()
    
    def get_tenant_engine(self, tenant_id: str):
        """Get database engine for specific tenant"""
        return self.tenant_engines.get(tenant_id)

class ResourceManager:
    """Resource quota management and monitoring"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.quota_definitions = self._initialize_quota_definitions()
    
    def _initialize_quota_definitions(self) -> Dict[TenantTier, Dict[ResourceType, ResourceQuota]]:
        """Initialize default resource quotas for each tier"""
        return {
            TenantTier.STARTER: {
                ResourceType.CPU: ResourceQuota(ResourceType.CPU, 2.0, unit="cores"),
                ResourceType.MEMORY: ResourceQuota(ResourceType.MEMORY, 4.0, unit="GB"),
                ResourceType.STORAGE: ResourceQuota(ResourceType.STORAGE, 10.0, unit="GB"),
                ResourceType.API_CALLS: ResourceQuota(ResourceType.API_CALLS, 10000, unit="calls/month"),
                ResourceType.ROBOTS: ResourceQuota(ResourceType.ROBOTS, 5, unit="robots"),
                ResourceType.USERS: ResourceQuota(ResourceType.USERS, 10, unit="users"),
                ResourceType.WORKFLOWS: ResourceQuota(ResourceType.WORKFLOWS, 20, unit="workflows")
            },
            TenantTier.PROFESSIONAL: {
                ResourceType.CPU: ResourceQuota(ResourceType.CPU, 8.0, unit="cores"),
                ResourceType.MEMORY: ResourceQuota(ResourceType.MEMORY, 16.0, unit="GB"),
                ResourceType.STORAGE: ResourceQuota(ResourceType.STORAGE, 100.0, unit="GB"),
                ResourceType.API_CALLS: ResourceQuota(ResourceType.API_CALLS, 100000, unit="calls/month"),
                ResourceType.ROBOTS: ResourceQuota(ResourceType.ROBOTS, 25, unit="robots"),
                ResourceType.USERS: ResourceQuota(ResourceType.USERS, 100, unit="users"),
                ResourceType.WORKFLOWS: ResourceQuota(ResourceType.WORKFLOWS, 200, unit="workflows")
            },
            TenantTier.ENTERPRISE: {
                ResourceType.CPU: ResourceQuota(ResourceType.CPU, 32.0, unit="cores"),
                ResourceType.MEMORY: ResourceQuota(ResourceType.MEMORY, 64.0, unit="GB"),
                ResourceType.STORAGE: ResourceQuota(ResourceType.STORAGE, 1000.0, unit="GB"),
                ResourceType.API_CALLS: ResourceQuota(ResourceType.API_CALLS, 1000000, unit="calls/month"),
                ResourceType.ROBOTS: ResourceQuota(ResourceType.ROBOTS, 100, unit="robots"),
                ResourceType.USERS: ResourceQuota(ResourceType.USERS, 1000, unit="users"),
                ResourceType.WORKFLOWS: ResourceQuota(ResourceType.WORKFLOWS, 1000, unit="workflows")
            }
        }
    
    async def check_resource_quota(self, tenant_id: str, resource_type: ResourceType, 
                                 requested_amount: float) -> bool:
        """Check if tenant can use requested amount of resource"""
        current_usage = await self.get_current_usage(tenant_id, resource_type)
        quota = await self.get_resource_quota(tenant_id, resource_type)
        
        if quota is None:
            return False
        
        return (current_usage + requested_amount) <= quota.limit
    
    async def consume_resource(self, tenant_id: str, resource_type: ResourceType, 
                             amount: float) -> bool:
        """Consume resource if quota allows"""
        if await self.check_resource_quota(tenant_id, resource_type, amount):
            # Update usage in Redis
            usage_key = f"usage:{tenant_id}:{resource_type.value}"
            self.redis_client.incrbyfloat(usage_key, amount)
            self.redis_client.expire(usage_key, 86400 * 31)  # 31 days TTL
            return True
        return False
    
    async def get_current_usage(self, tenant_id: str, resource_type: ResourceType) -> float:
        """Get current resource usage for tenant"""
        usage_key = f"usage:{tenant_id}:{resource_type.value}"
        usage = self.redis_client.get(usage_key)
        return float(usage) if usage else 0.0
    
    async def get_resource_quota(self, tenant_id: str, resource_type: ResourceType) -> Optional[ResourceQuota]:
        """Get resource quota for tenant"""
        # This would typically load from database
        # For now, return default based on tier
        tenant_config = await self.get_tenant_config(tenant_id)
        if tenant_config and resource_type in tenant_config.resource_quotas:
            return tenant_config.resource_quotas[resource_type]
        return None
    
    async def get_tenant_config(self, tenant_id: str) -> Optional[TenantConfiguration]:
        """Get tenant configuration (simplified)"""
        # This would load from database
        return None

class KubernetesManager:
    """Kubernetes-based auto-scaling and resource management"""
    
    def __init__(self):
        try:
            config.load_incluster_config()  # For in-cluster deployment
        except:
            config.load_kube_config()  # For local development
        
        self.v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()
        self.autoscaling_v1 = client.AutoscalingV1Api()
    
    async def create_tenant_namespace(self, tenant_id: str) -> bool:
        """Create Kubernetes namespace for tenant"""
        namespace_name = f"tenant-{tenant_id}"
        
        namespace = client.V1Namespace(
            metadata=client.V1ObjectMeta(
                name=namespace_name,
                labels={
                    "tenant-id": tenant_id,
                    "managed-by": "automation-platform"
                }
            )
        )
        
        try:
            self.v1.create_namespace(namespace)
            logger.info(f"Created namespace for tenant: {tenant_id}")
            return True
        except Exception as e:
            logger.error(f"Error creating namespace for tenant {tenant_id}: {e}")
            return False
    
    async def deploy_tenant_services(self, tenant_id: str, tenant_config: TenantConfiguration) -> bool:
        """Deploy tenant-specific services"""
        namespace = f"tenant-{tenant_id}"
        
        try:
            # Deploy API service
            await self._deploy_api_service(namespace, tenant_config)
            
            # Deploy worker services
            await self._deploy_worker_services(namespace, tenant_config)
            
            # Deploy database if needed
            if tenant_config.tier == TenantTier.ENTERPRISE:
                await self._deploy_dedicated_database(namespace, tenant_config)
            
            # Setup auto-scaling
            await self._setup_autoscaling(namespace, tenant_config)
            
            logger.info(f"Deployed services for tenant: {tenant_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deploying services for tenant {tenant_id}: {e}")
            return False
    
    async def _deploy_api_service(self, namespace: str, tenant_config: TenantConfiguration):
        """Deploy API service for tenant"""
        deployment = client.V1Deployment(
            metadata=client.V1ObjectMeta(name="api-service", namespace=namespace),
            spec=client.V1DeploymentSpec(
                replicas=1,
                selector=client.V1LabelSelector(
                    match_labels={"app": "api-service"}
                ),
                template=client.V1PodTemplateSpec(
                    metadata=client.V1ObjectMeta(
                        labels={"app": "api-service"}
                    ),
                    spec=client.V1PodSpec(
                        containers=[
                            client.V1Container(
                                name="api",
                                image="automation-platform/api:latest",
                                ports=[client.V1ContainerPort(container_port=8000)],
                                env=[
                                    client.V1EnvVar(name="TENANT_ID", value=tenant_config.tenant_id),
                                    client.V1EnvVar(name="TENANT_TIER", value=tenant_config.tier.value)
                                ],
                                resources=client.V1ResourceRequirements(
                                    requests={
                                        "cpu": "500m",
                                        "memory": "1Gi"
                                    },
                                    limits={
                                        "cpu": "1000m",
                                        "memory": "2Gi"
                                    }
                                )
                            )
                        ]
                    )
                )
            )
        )
        
        self.apps_v1.create_namespaced_deployment(namespace=namespace, body=deployment)
    
    async def _deploy_worker_services(self, namespace: str, tenant_config: TenantConfiguration):
        """Deploy worker services for tenant"""
        # Similar to API service but for background workers
        pass
    
    async def _deploy_dedicated_database(self, namespace: str, tenant_config: TenantConfiguration):
        """Deploy dedicated database for enterprise tenants"""
        # Deploy PostgreSQL or other database
        pass
    
    async def _setup_autoscaling(self, namespace: str, tenant_config: TenantConfiguration):
        """Setup horizontal pod autoscaling"""
        hpa = client.V1HorizontalPodAutoscaler(
            metadata=client.V1ObjectMeta(name="api-service-hpa", namespace=namespace),
            spec=client.V1HorizontalPodAutoscalerSpec(
                scale_target_ref=client.V1CrossVersionObjectReference(
                    api_version="apps/v1",
                    kind="Deployment",
                    name="api-service"
                ),
                min_replicas=1,
                max_replicas=10,
                target_cpu_utilization_percentage=70
            )
        )
        
        self.autoscaling_v1.create_namespaced_horizontal_pod_autoscaler(
            namespace=namespace, body=hpa
        )

class TenantManager:
    """Main tenant management orchestrator"""
    
    def __init__(self, master_db_url: str, redis_url: str):
        self.db_manager = DatabaseManager(master_db_url)
        self.redis_client = redis.from_url(redis_url)
        self.resource_manager = ResourceManager(self.redis_client)
        self.k8s_manager = KubernetesManager()
        self.tenants = {}
        
    async def create_tenant(self, name: str, domain: str, admin_email: str, 
                          tier: TenantTier = TenantTier.STARTER) -> TenantConfiguration:
        """Create new tenant with full isolation"""
        tenant_id = str(uuid.uuid4())
        
        # Create tenant configuration
        tenant_config = TenantConfiguration(
            tenant_id=tenant_id,
            name=name,
            domain=domain,
            tier=tier,
            status=TenantStatus.TRIAL,
            admin_email=admin_email,
            created_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),  # 30-day trial
            resource_quotas=self.resource_manager.quota_definitions[tier].copy(),
            features=self._get_tier_features(tier),
            custom_branding={},
            database_config={},
            storage_config={}
        )
        
        try:
            # Create isolated database
            db_url = await self.db_manager.create_tenant_database(tenant_config)
            tenant_config.database_config['url'] = db_url
            
            # Create Kubernetes namespace and deploy services
            await self.k8s_manager.create_tenant_namespace(tenant_id)
            await self.k8s_manager.deploy_tenant_services(tenant_id, tenant_config)
            
            # Setup storage isolation
            await self._setup_tenant_storage(tenant_config)
            
            # Cache tenant configuration
            self.tenants[tenant_id] = tenant_config
            self.redis_client.setex(
                f"tenant:{tenant_id}",
                86400,  # 24 hours TTL
                json.dumps(asdict(tenant_config), default=str)
            )
            
            logger.info(f"Created tenant: {name} ({tenant_id})")
            return tenant_config
            
        except Exception as e:
            logger.error(f"Error creating tenant {name}: {e}")
            # Cleanup on failure
            await self._cleanup_failed_tenant(tenant_id)
            raise
    
    def _get_tier_features(self, tier: TenantTier) -> Set[str]:
        """Get features available for tenant tier"""
        feature_sets = {
            TenantTier.STARTER: {
                "basic_automation", "task_management", "robot_control", 
                "basic_analytics", "email_support"
            },
            TenantTier.PROFESSIONAL: {
                "basic_automation", "task_management", "robot_control",
                "advanced_analytics", "workflow_designer", "api_access",
                "priority_support", "custom_integrations"
            },
            TenantTier.ENTERPRISE: {
                "basic_automation", "task_management", "robot_control",
                "advanced_analytics", "workflow_designer", "api_access",
                "priority_support", "custom_integrations", "sso",
                "advanced_security", "compliance_tools", "dedicated_support",
                "custom_branding", "white_label"
            }
        }
        return feature_sets.get(tier, set())
    
    async def _setup_tenant_storage(self, tenant_config: TenantConfiguration):
        """Setup isolated storage for tenant"""
        # Create S3 bucket or similar for tenant data
        bucket_name = f"automation-tenant-{tenant_config.tenant_id}"
        
        # This would create actual cloud storage
        tenant_config.storage_config['bucket'] = bucket_name
        tenant_config.storage_config['region'] = 'us-east-1'
    
    async def _cleanup_failed_tenant(self, tenant_id: str):
        """Cleanup resources for failed tenant creation"""
        try:
            # Delete Kubernetes namespace
            namespace = f"tenant-{tenant_id}"
            self.k8s_manager.v1.delete_namespace(name=namespace)
            
            # Delete database
            # This would drop the tenant database
            
            # Delete storage
            # This would delete the tenant's storage bucket
            
            logger.info(f"Cleaned up failed tenant: {tenant_id}")
        except Exception as e:
            logger.error(f"Error cleaning up failed tenant {tenant_id}: {e}")
    
    async def get_tenant_usage_metrics(self, tenant_id: str) -> TenantUsageMetrics:
        """Get comprehensive usage metrics for tenant"""
        resource_usage = {}
        
        for resource_type in ResourceType:
            usage = await self.resource_manager.get_current_usage(tenant_id, resource_type)
            resource_usage[resource_type] = usage
        
        # Calculate cost estimate based on usage
        cost_estimate = self._calculate_cost_estimate(resource_usage)
        
        return TenantUsageMetrics(
            tenant_id=tenant_id,
            timestamp=datetime.now(timezone.utc),
            resource_usage=resource_usage,
            active_users=int(resource_usage.get(ResourceType.USERS, 0)),
            api_requests=int(resource_usage.get(ResourceType.API_CALLS, 0)),
            storage_used=resource_usage.get(ResourceType.STORAGE, 0),
            bandwidth_used=resource_usage.get(ResourceType.BANDWIDTH, 0),
            cost_estimate=cost_estimate
        )
    
    def _calculate_cost_estimate(self, resource_usage: Dict[ResourceType, float]) -> float:
        """Calculate cost estimate based on resource usage"""
        # Simplified cost calculation
        cost_per_unit = {
            ResourceType.CPU: 0.05,  # $0.05 per core-hour
            ResourceType.MEMORY: 0.01,  # $0.01 per GB-hour
            ResourceType.STORAGE: 0.001,  # $0.001 per GB-month
            ResourceType.API_CALLS: 0.0001,  # $0.0001 per call
        }
        
        total_cost = 0.0
        for resource_type, usage in resource_usage.items():
            if resource_type in cost_per_unit:
                total_cost += usage * cost_per_unit[resource_type]
        
        return total_cost

# Global tenant manager instance
tenant_manager = None

async def initialize_tenant_manager(master_db_url: str, redis_url: str):
    """Initialize global tenant manager"""
    global tenant_manager
    tenant_manager = TenantManager(master_db_url, redis_url)
    return tenant_manager
