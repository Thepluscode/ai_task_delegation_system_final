"""
Enterprise System Integration Hub
Comprehensive integration layer for ERP, MES, SCADA, and other enterprise systems
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import aiohttp
import xml.etree.ElementTree as ET
from sqlalchemy import create_engine, text
import redis
from azure.servicebus import ServiceBusClient
import boto3
from google.cloud import pubsub_v1

logger = logging.getLogger(__name__)

class IntegrationType(Enum):
    ERP = "erp"
    MES = "mes"
    SCADA = "scada"
    WMS = "wms"
    CRM = "crm"
    PLM = "plm"
    QMS = "qms"
    LIMS = "lims"

class ProtocolType(Enum):
    REST_API = "rest_api"
    SOAP = "soap"
    OPC_UA = "opc_ua"
    MODBUS = "modbus"
    MQTT = "mqtt"
    DATABASE = "database"
    FILE_TRANSFER = "file_transfer"
    MESSAGE_QUEUE = "message_queue"

@dataclass
class IntegrationConfig:
    system_id: str
    system_name: str
    integration_type: IntegrationType
    protocol_type: ProtocolType
    endpoint_url: str
    authentication: Dict[str, Any]
    data_mapping: Dict[str, str]
    sync_frequency: int  # seconds
    enabled: bool = True
    retry_attempts: int = 3
    timeout: int = 30

@dataclass
class DataSyncResult:
    system_id: str
    timestamp: datetime
    records_processed: int
    records_success: int
    records_failed: int
    errors: List[str]
    execution_time: float

class ERPConnector:
    """Connector for ERP systems (SAP, Oracle, Microsoft Dynamics)"""
    
    def __init__(self, config: IntegrationConfig):
        self.config = config
        self.session = None
        
    async def connect(self):
        """Establish connection to ERP system"""
        if self.config.protocol_type == ProtocolType.REST_API:
            self.session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.config.timeout)
            )
        elif self.config.protocol_type == ProtocolType.DATABASE:
            self.engine = create_engine(self.config.endpoint_url)
    
    async def sync_work_orders(self) -> DataSyncResult:
        """Sync work orders from ERP to automation platform"""
        start_time = datetime.now()
        errors = []
        processed = 0
        success = 0
        
        try:
            if self.config.system_name.lower() == 'sap':
                data = await self._sync_sap_work_orders()
            elif self.config.system_name.lower() == 'oracle':
                data = await self._sync_oracle_work_orders()
            elif self.config.system_name.lower() == 'dynamics':
                data = await self._sync_dynamics_work_orders()
            else:
                data = await self._sync_generic_work_orders()
            
            processed = len(data)
            success = processed  # Simplified for demo
            
        except Exception as e:
            errors.append(str(e))
            logger.error(f"Error syncing work orders from {self.config.system_name}: {e}")
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return DataSyncResult(
            system_id=self.config.system_id,
            timestamp=datetime.now(timezone.utc),
            records_processed=processed,
            records_success=success,
            records_failed=processed - success,
            errors=errors,
            execution_time=execution_time
        )
    
    async def _sync_sap_work_orders(self) -> List[Dict]:
        """Sync work orders from SAP system"""
        # SAP-specific integration logic
        headers = {
            'Authorization': f"Bearer {self.config.authentication.get('token')}",
            'Content-Type': 'application/json'
        }
        
        async with self.session.get(
            f"{self.config.endpoint_url}/sap/opu/odata/sap/API_PRODUCTION_ORDER_2_SRV/A_ProductionOrder",
            headers=headers
        ) as response:
            if response.status == 200:
                data = await response.json()
                return data.get('d', {}).get('results', [])
            else:
                raise Exception(f"SAP API error: {response.status}")
    
    async def _sync_oracle_work_orders(self) -> List[Dict]:
        """Sync work orders from Oracle system"""
        # Oracle-specific integration logic
        query = """
        SELECT wo.work_order_id, wo.item_number, wo.quantity, wo.status
        FROM wip_discrete_jobs wo
        WHERE wo.status_type IN (1, 3, 4)
        """
        
        with self.engine.connect() as conn:
            result = conn.execute(text(query))
            return [dict(row) for row in result]
    
    async def _sync_dynamics_work_orders(self) -> List[Dict]:
        """Sync work orders from Microsoft Dynamics"""
        # Dynamics-specific integration logic
        headers = {
            'Authorization': f"Bearer {self.config.authentication.get('token')}",
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0'
        }
        
        async with self.session.get(
            f"{self.config.endpoint_url}/data/ProductionOrders",
            headers=headers
        ) as response:
            if response.status == 200:
                data = await response.json()
                return data.get('value', [])
            else:
                raise Exception(f"Dynamics API error: {response.status}")
    
    async def _sync_generic_work_orders(self) -> List[Dict]:
        """Generic work order sync for other ERP systems"""
        headers = {
            'Authorization': f"Bearer {self.config.authentication.get('token')}",
            'Content-Type': 'application/json'
        }
        
        async with self.session.get(
            f"{self.config.endpoint_url}/api/workorders",
            headers=headers
        ) as response:
            if response.status == 200:
                return await response.json()
            else:
                raise Exception(f"API error: {response.status}")

class MESConnector:
    """Connector for Manufacturing Execution Systems"""
    
    def __init__(self, config: IntegrationConfig):
        self.config = config
        
    async def sync_production_data(self) -> DataSyncResult:
        """Sync production data from MES"""
        start_time = datetime.now()
        errors = []
        processed = 0
        success = 0
        
        try:
            # Connect to MES system
            if self.config.protocol_type == ProtocolType.OPC_UA:
                data = await self._sync_opc_ua_data()
            elif self.config.protocol_type == ProtocolType.DATABASE:
                data = await self._sync_mes_database()
            else:
                data = await self._sync_mes_api()
            
            processed = len(data)
            success = processed
            
        except Exception as e:
            errors.append(str(e))
            logger.error(f"Error syncing MES data: {e}")
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return DataSyncResult(
            system_id=self.config.system_id,
            timestamp=datetime.now(timezone.utc),
            records_processed=processed,
            records_success=success,
            records_failed=processed - success,
            errors=errors,
            execution_time=execution_time
        )
    
    async def _sync_opc_ua_data(self) -> List[Dict]:
        """Sync data via OPC-UA protocol"""
        # OPC-UA client implementation
        # This would use asyncua library in real implementation
        return [
            {
                'node_id': 'ns=2;i=1001',
                'value': 95.5,
                'timestamp': datetime.now().isoformat(),
                'quality': 'Good'
            }
        ]
    
    async def _sync_mes_database(self) -> List[Dict]:
        """Sync MES data from database"""
        query = """
        SELECT production_line, part_number, quantity_produced, 
               quality_status, timestamp
        FROM production_data
        WHERE timestamp >= NOW() - INTERVAL 1 HOUR
        """
        
        engine = create_engine(self.config.endpoint_url)
        with engine.connect() as conn:
            result = conn.execute(text(query))
            return [dict(row) for row in result]
    
    async def _sync_mes_api(self) -> List[Dict]:
        """Sync MES data via REST API"""
        async with aiohttp.ClientSession() as session:
            headers = {
                'Authorization': f"Bearer {self.config.authentication.get('token')}",
                'Content-Type': 'application/json'
            }
            
            async with session.get(
                f"{self.config.endpoint_url}/api/production/current",
                headers=headers
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"MES API error: {response.status}")

class SCADAConnector:
    """Connector for SCADA systems"""
    
    def __init__(self, config: IntegrationConfig):
        self.config = config
        
    async def sync_sensor_data(self) -> DataSyncResult:
        """Sync real-time sensor data from SCADA"""
        start_time = datetime.now()
        errors = []
        processed = 0
        success = 0
        
        try:
            if self.config.protocol_type == ProtocolType.MODBUS:
                data = await self._sync_modbus_data()
            elif self.config.protocol_type == ProtocolType.MQTT:
                data = await self._sync_mqtt_data()
            else:
                data = await self._sync_scada_api()
            
            processed = len(data)
            success = processed
            
        except Exception as e:
            errors.append(str(e))
            logger.error(f"Error syncing SCADA data: {e}")
        
        execution_time = (datetime.now() - start_time).total_seconds()
        
        return DataSyncResult(
            system_id=self.config.system_id,
            timestamp=datetime.now(timezone.utc),
            records_processed=processed,
            records_success=success,
            records_failed=processed - success,
            errors=errors,
            execution_time=execution_time
        )
    
    async def _sync_modbus_data(self) -> List[Dict]:
        """Sync data via Modbus protocol"""
        # Modbus client implementation
        # This would use pymodbus library in real implementation
        return [
            {
                'register': 40001,
                'value': 75.2,
                'unit': 'temperature',
                'timestamp': datetime.now().isoformat()
            }
        ]
    
    async def _sync_mqtt_data(self) -> List[Dict]:
        """Sync data via MQTT protocol"""
        # MQTT client implementation
        # This would use paho-mqtt library in real implementation
        return [
            {
                'topic': 'sensors/temperature/line1',
                'value': 72.5,
                'timestamp': datetime.now().isoformat()
            }
        ]
    
    async def _sync_scada_api(self) -> List[Dict]:
        """Sync SCADA data via REST API"""
        async with aiohttp.ClientSession() as session:
            headers = {
                'Authorization': f"Bearer {self.config.authentication.get('token')}",
                'Content-Type': 'application/json'
            }
            
            async with session.get(
                f"{self.config.endpoint_url}/api/sensors/current",
                headers=headers
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise Exception(f"SCADA API error: {response.status}")

class CloudIntegrationHub:
    """Integration hub for cloud platforms (AWS, Azure, Google Cloud)"""
    
    def __init__(self):
        self.aws_client = None
        self.azure_client = None
        self.gcp_client = None
        
    async def setup_aws_integration(self, config: Dict[str, Any]):
        """Setup AWS integration"""
        self.aws_client = boto3.client(
            's3',
            aws_access_key_id=config.get('access_key'),
            aws_secret_access_key=config.get('secret_key'),
            region_name=config.get('region', 'us-east-1')
        )
    
    async def setup_azure_integration(self, config: Dict[str, Any]):
        """Setup Azure integration"""
        self.azure_client = ServiceBusClient.from_connection_string(
            config.get('connection_string')
        )
    
    async def setup_gcp_integration(self, config: Dict[str, Any]):
        """Setup Google Cloud integration"""
        self.gcp_client = pubsub_v1.PublisherClient()
    
    async def sync_to_cloud(self, data: Dict[str, Any], platform: str) -> bool:
        """Sync data to cloud platform"""
        try:
            if platform == 'aws' and self.aws_client:
                # Upload to S3
                self.aws_client.put_object(
                    Bucket='automation-data',
                    Key=f"sync/{datetime.now().isoformat()}.json",
                    Body=json.dumps(data)
                )
                return True
            elif platform == 'azure' and self.azure_client:
                # Send to Service Bus
                with self.azure_client:
                    sender = self.azure_client.get_queue_sender(queue_name="automation-queue")
                    with sender:
                        sender.send_messages(json.dumps(data))
                return True
            elif platform == 'gcp' and self.gcp_client:
                # Publish to Pub/Sub
                topic_path = self.gcp_client.topic_path('project-id', 'automation-topic')
                self.gcp_client.publish(topic_path, json.dumps(data).encode('utf-8'))
                return True
        except Exception as e:
            logger.error(f"Error syncing to {platform}: {e}")
            return False

class EnterpriseIntegrationManager:
    """Main integration manager for all enterprise systems"""
    
    def __init__(self):
        self.connectors = {}
        self.cloud_hub = CloudIntegrationHub()
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        
    async def register_system(self, config: IntegrationConfig):
        """Register a new enterprise system for integration"""
        if config.integration_type == IntegrationType.ERP:
            connector = ERPConnector(config)
        elif config.integration_type == IntegrationType.MES:
            connector = MESConnector(config)
        elif config.integration_type == IntegrationType.SCADA:
            connector = SCADAConnector(config)
        else:
            raise ValueError(f"Unsupported integration type: {config.integration_type}")
        
        await connector.connect()
        self.connectors[config.system_id] = connector
        
        # Store configuration in Redis
        self.redis_client.set(
            f"integration:config:{config.system_id}",
            json.dumps(asdict(config))
        )
        
        logger.info(f"Registered {config.integration_type.value} system: {config.system_name}")
    
    async def sync_all_systems(self) -> List[DataSyncResult]:
        """Sync data from all registered systems"""
        results = []
        
        for system_id, connector in self.connectors.items():
            try:
                if isinstance(connector, ERPConnector):
                    result = await connector.sync_work_orders()
                elif isinstance(connector, MESConnector):
                    result = await connector.sync_production_data()
                elif isinstance(connector, SCADAConnector):
                    result = await connector.sync_sensor_data()
                else:
                    continue
                
                results.append(result)
                
                # Cache sync result
                self.redis_client.setex(
                    f"sync:result:{system_id}",
                    3600,  # 1 hour TTL
                    json.dumps(asdict(result))
                )
                
            except Exception as e:
                logger.error(f"Error syncing system {system_id}: {e}")
                results.append(DataSyncResult(
                    system_id=system_id,
                    timestamp=datetime.now(timezone.utc),
                    records_processed=0,
                    records_success=0,
                    records_failed=0,
                    errors=[str(e)],
                    execution_time=0.0
                ))
        
        return results
    
    async def get_sync_status(self) -> Dict[str, Any]:
        """Get overall sync status for all systems"""
        status = {
            'total_systems': len(self.connectors),
            'last_sync': datetime.now(timezone.utc).isoformat(),
            'systems': {}
        }
        
        for system_id in self.connectors.keys():
            cached_result = self.redis_client.get(f"sync:result:{system_id}")
            if cached_result:
                result = json.loads(cached_result)
                status['systems'][system_id] = {
                    'last_sync': result['timestamp'],
                    'status': 'success' if result['records_failed'] == 0 else 'partial_failure',
                    'records_processed': result['records_processed'],
                    'errors': result['errors']
                }
            else:
                status['systems'][system_id] = {
                    'status': 'no_data',
                    'last_sync': None
                }
        
        return status

# Global integration manager instance
integration_manager = EnterpriseIntegrationManager()
