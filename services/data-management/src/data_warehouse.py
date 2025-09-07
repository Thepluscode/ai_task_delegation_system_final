"""
Advanced Data Management System
Enterprise data warehouse, data lake, and real-time streaming platform
"""

import asyncio
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum
import pandas as pd
import numpy as np
import redis
from sqlalchemy import create_engine, text, MetaData, Table, Column, String, DateTime, Float, Integer, JSON, Boolean
from kafka import KafkaProducer, KafkaConsumer
import boto3
from elasticsearch import Elasticsearch
import mlflow
import mlflow.sklearn
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

logger = logging.getLogger(__name__)

class DataType(Enum):
    STRUCTURED = "structured"
    UNSTRUCTURED = "unstructured"
    STREAMING = "streaming"
    TIME_SERIES = "time_series"

class DataSource(Enum):
    ERP = "erp"
    MES = "mes"
    SCADA = "scada"
    IOT_SENSORS = "iot_sensors"
    ROBOTS = "robots"
    HUMANS = "humans"
    EXTERNAL_API = "external_api"

@dataclass
class DataAsset:
    asset_id: str
    name: str
    description: str
    data_type: DataType
    source: DataSource
    schema: Dict[str, Any]
    location: str
    created_at: datetime
    last_updated: datetime
    tags: List[str]
    quality_score: float
    lineage: List[str]

class DataWarehouse:
    """Enterprise data warehouse with data lake capabilities"""
    
    def __init__(self, warehouse_url: str, lake_config: Dict[str, Any]):
        self.warehouse_engine = create_engine(warehouse_url)
        self.lake_config = lake_config
        self.s3_client = boto3.client('s3', **lake_config.get('aws_config', {}))
        self.elasticsearch = Elasticsearch([lake_config.get('elasticsearch_url', 'localhost:9200')])
        self.data_catalog = {}
        self.metadata = MetaData()
        self._initialize_warehouse_schema()
    
    def _initialize_warehouse_schema(self):
        """Initialize data warehouse schema"""
        # Fact tables
        self.task_facts = Table(
            'task_facts',
            self.metadata,
            Column('fact_id', String(50), primary_key=True),
            Column('task_id', String(50), nullable=False),
            Column('robot_id', String(50)),
            Column('human_id', String(50)),
            Column('start_time', DateTime, nullable=False),
            Column('end_time', DateTime),
            Column('duration_minutes', Float),
            Column('success', Boolean),
            Column('cost', Float),
            Column('quality_score', Float),
            Column('efficiency_score', Float),
            Column('date_key', String(10)),
            Column('time_key', String(8))
        )
        
        # Dimension tables
        self.robot_dimension = Table(
            'robot_dimension',
            self.metadata,
            Column('robot_key', String(50), primary_key=True),
            Column('robot_id', String(50), nullable=False),
            Column('robot_type', String(100)),
            Column('manufacturer', String(100)),
            Column('location', String(255)),
            Column('capabilities', JSON),
            Column('effective_date', DateTime),
            Column('expiry_date', DateTime)
        )
        
        self.human_dimension = Table(
            'human_dimension',
            self.metadata,
            Column('human_key', String(50), primary_key=True),
            Column('human_id', String(50), nullable=False),
            Column('role', String(100)),
            Column('skills', JSON),
            Column('department', String(100)),
            Column('location', String(255)),
            Column('effective_date', DateTime),
            Column('expiry_date', DateTime)
        )
        
        # Data catalog table
        self.data_catalog_table = Table(
            'data_catalog',
            self.metadata,
            Column('asset_id', String(50), primary_key=True),
            Column('name', String(255), nullable=False),
            Column('description', String(1000)),
            Column('data_type', String(50)),
            Column('source', String(50)),
            Column('location', String(500)),
            Column('schema_definition', JSON),
            Column('tags', JSON),
            Column('quality_score', Float),
            Column('lineage', JSON),
            Column('created_at', DateTime),
            Column('last_updated', DateTime)
        )
        
        # Create all tables
        self.metadata.create_all(self.warehouse_engine)
    
    async def ingest_structured_data(self, data: Dict[str, Any], source: DataSource) -> str:
        """Ingest structured data into warehouse"""
        try:
            # Transform data based on source
            transformed_data = await self._transform_data(data, source)
            
            # Load into appropriate fact/dimension tables
            if source == DataSource.ROBOTS:
                await self._load_robot_data(transformed_data)
            elif source == DataSource.HUMANS:
                await self._load_human_data(transformed_data)
            else:
                await self._load_task_data(transformed_data)
            
            logger.info(f"Successfully ingested structured data from {source.value}")
            return "success"
            
        except Exception as e:
            logger.error(f"Error ingesting structured data: {e}")
            raise
    
    async def ingest_unstructured_data(self, data: bytes, metadata: Dict[str, Any]) -> str:
        """Ingest unstructured data into data lake"""
        try:
            # Store in S3 data lake
            bucket = self.lake_config.get('bucket', 'automation-data-lake')
            key = f"unstructured/{metadata['source']}/{datetime.now().isoformat()}/{metadata['filename']}"
            
            self.s3_client.put_object(
                Bucket=bucket,
                Key=key,
                Body=data,
                Metadata=metadata
            )
            
            # Index metadata in Elasticsearch
            doc = {
                'location': f"s3://{bucket}/{key}",
                'metadata': metadata,
                'ingested_at': datetime.now().isoformat(),
                'data_type': 'unstructured'
            }
            
            self.elasticsearch.index(
                index='data-catalog',
                body=doc
            )
            
            logger.info(f"Successfully ingested unstructured data: {metadata['filename']}")
            return f"s3://{bucket}/{key}"
            
        except Exception as e:
            logger.error(f"Error ingesting unstructured data: {e}")
            raise
    
    async def _transform_data(self, data: Dict[str, Any], source: DataSource) -> Dict[str, Any]:
        """Transform data based on source system"""
        # Apply source-specific transformations
        if source == DataSource.ERP:
            return self._transform_erp_data(data)
        elif source == DataSource.MES:
            return self._transform_mes_data(data)
        elif source == DataSource.SCADA:
            return self._transform_scada_data(data)
        else:
            return data
    
    def _transform_erp_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform ERP data to warehouse format"""
        return {
            'task_id': data.get('work_order_id'),
            'start_time': data.get('planned_start'),
            'end_time': data.get('planned_end'),
            'cost': data.get('estimated_cost'),
            'priority': data.get('priority'),
            'status': data.get('status')
        }
    
    def _transform_mes_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform MES data to warehouse format"""
        return {
            'task_id': data.get('production_order'),
            'quality_score': data.get('quality_rating'),
            'efficiency_score': data.get('oee'),
            'actual_duration': data.get('cycle_time')
        }
    
    def _transform_scada_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Transform SCADA data to warehouse format"""
        return {
            'sensor_readings': data.get('values'),
            'alarm_status': data.get('alarms'),
            'equipment_status': data.get('status')
        }
    
    async def _load_robot_data(self, data: Dict[str, Any]):
        """Load robot data into dimension table"""
        with self.warehouse_engine.connect() as conn:
            conn.execute(
                self.robot_dimension.insert().values(
                    robot_key=f"{data['robot_id']}_{datetime.now().isoformat()}",
                    robot_id=data['robot_id'],
                    robot_type=data.get('robot_type'),
                    manufacturer=data.get('manufacturer'),
                    location=data.get('location'),
                    capabilities=data.get('capabilities', {}),
                    effective_date=datetime.now(timezone.utc),
                    expiry_date=None
                )
            )
            conn.commit()
    
    async def _load_human_data(self, data: Dict[str, Any]):
        """Load human data into dimension table"""
        with self.warehouse_engine.connect() as conn:
            conn.execute(
                self.human_dimension.insert().values(
                    human_key=f"{data['human_id']}_{datetime.now().isoformat()}",
                    human_id=data['human_id'],
                    role=data.get('role'),
                    skills=data.get('skills', []),
                    department=data.get('department'),
                    location=data.get('location'),
                    effective_date=datetime.now(timezone.utc),
                    expiry_date=None
                )
            )
            conn.commit()
    
    async def _load_task_data(self, data: Dict[str, Any]):
        """Load task data into fact table"""
        with self.warehouse_engine.connect() as conn:
            start_time = datetime.fromisoformat(data['start_time']) if isinstance(data['start_time'], str) else data['start_time']
            end_time = datetime.fromisoformat(data['end_time']) if isinstance(data['end_time'], str) and data.get('end_time') else None
            
            duration = None
            if start_time and end_time:
                duration = (end_time - start_time).total_seconds() / 60
            
            conn.execute(
                self.task_facts.insert().values(
                    fact_id=f"{data['task_id']}_{datetime.now().timestamp()}",
                    task_id=data['task_id'],
                    robot_id=data.get('robot_id'),
                    human_id=data.get('human_id'),
                    start_time=start_time,
                    end_time=end_time,
                    duration_minutes=duration,
                    success=data.get('success', True),
                    cost=data.get('cost', 0.0),
                    quality_score=data.get('quality_score', 1.0),
                    efficiency_score=data.get('efficiency_score', 1.0),
                    date_key=start_time.strftime('%Y-%m-%d') if start_time else None,
                    time_key=start_time.strftime('%H:%M:%S') if start_time else None
                )
            )
            conn.commit()
    
    async def register_data_asset(self, asset: DataAsset):
        """Register data asset in catalog"""
        with self.warehouse_engine.connect() as conn:
            conn.execute(
                self.data_catalog_table.insert().values(
                    asset_id=asset.asset_id,
                    name=asset.name,
                    description=asset.description,
                    data_type=asset.data_type.value,
                    source=asset.source.value,
                    location=asset.location,
                    schema_definition=asset.schema,
                    tags=asset.tags,
                    quality_score=asset.quality_score,
                    lineage=asset.lineage,
                    created_at=asset.created_at,
                    last_updated=asset.last_updated
                )
            )
            conn.commit()
        
        self.data_catalog[asset.asset_id] = asset
        logger.info(f"Registered data asset: {asset.name}")
    
    async def search_data_catalog(self, query: str, filters: Dict[str, Any] = None) -> List[DataAsset]:
        """Search data catalog"""
        # Search in Elasticsearch
        search_body = {
            "query": {
                "bool": {
                    "must": [
                        {"multi_match": {
                            "query": query,
                            "fields": ["name", "description", "tags"]
                        }}
                    ]
                }
            }
        }
        
        # Add filters
        if filters:
            for key, value in filters.items():
                search_body["query"]["bool"]["must"].append({
                    "term": {key: value}
                })
        
        try:
            response = self.elasticsearch.search(
                index='data-catalog',
                body=search_body
            )
            
            results = []
            for hit in response['hits']['hits']:
                source = hit['_source']
                asset = DataAsset(
                    asset_id=source['asset_id'],
                    name=source['name'],
                    description=source['description'],
                    data_type=DataType(source['data_type']),
                    source=DataSource(source['source']),
                    schema=source['schema_definition'],
                    location=source['location'],
                    created_at=datetime.fromisoformat(source['created_at']),
                    last_updated=datetime.fromisoformat(source['last_updated']),
                    tags=source['tags'],
                    quality_score=source['quality_score'],
                    lineage=source['lineage']
                )
                results.append(asset)
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching data catalog: {e}")
            return []

class StreamingProcessor:
    """Real-time data streaming processor"""
    
    def __init__(self, kafka_config: Dict[str, Any]):
        self.kafka_config = kafka_config
        self.producer = KafkaProducer(
            bootstrap_servers=kafka_config.get('bootstrap_servers', ['localhost:9092']),
            value_serializer=lambda v: json.dumps(v, default=str).encode('utf-8')
        )
        self.consumers = {}
        self.processing_rules = {}
    
    async def publish_event(self, topic: str, event: Dict[str, Any]) -> bool:
        """Publish event to Kafka topic"""
        try:
            # Add timestamp and metadata
            enriched_event = {
                **event,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'event_id': f"{topic}_{datetime.now().timestamp()}"
            }
            
            # Send to Kafka
            future = self.producer.send(topic, enriched_event)
            record_metadata = future.get(timeout=10)
            
            logger.info(f"Published event to {topic}: partition {record_metadata.partition}, offset {record_metadata.offset}")
            return True
            
        except Exception as e:
            logger.error(f"Error publishing event to {topic}: {e}")
            return False
    
    async def start_consumer(self, topic: str, processing_function: callable):
        """Start consuming events from topic"""
        consumer = KafkaConsumer(
            topic,
            bootstrap_servers=self.kafka_config.get('bootstrap_servers', ['localhost:9092']),
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            group_id=f"automation_platform_{topic}"
        )
        
        self.consumers[topic] = consumer
        
        # Process messages in background
        asyncio.create_task(self._process_messages(consumer, processing_function))
        
        logger.info(f"Started consumer for topic: {topic}")
    
    async def _process_messages(self, consumer: KafkaConsumer, processing_function: callable):
        """Process messages from Kafka consumer"""
        for message in consumer:
            try:
                event = message.value
                await processing_function(event)
            except Exception as e:
                logger.error(f"Error processing message: {e}")

# Global instances
data_warehouse = None
streaming_processor = None
