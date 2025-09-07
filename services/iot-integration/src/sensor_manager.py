"""
IoT & Sensor Integration System
Comprehensive IoT device management, sensor data collection, and edge computing
"""

import asyncio
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import numpy as np
import paho.mqtt.client as mqtt
import redis
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

logger = logging.getLogger(__name__)

class SensorType(Enum):
    TEMPERATURE = "temperature"
    HUMIDITY = "humidity"
    PRESSURE = "pressure"
    VIBRATION = "vibration"
    PROXIMITY = "proximity"
    LIGHT = "light"
    SOUND = "sound"
    AIR_QUALITY = "air_quality"
    MOTION = "motion"
    FORCE = "force"
    FLOW = "flow"
    LEVEL = "level"
    PH = "ph"
    CONDUCTIVITY = "conductivity"

class ProtocolType(Enum):
    MQTT = "mqtt"
    MODBUS = "modbus"
    OPC_UA = "opc_ua"
    HTTP = "http"
    COAP = "coap"
    ZIGBEE = "zigbee"
    LORA = "lora"
    BLUETOOTH = "bluetooth"
    WIFI = "wifi"

class DeviceStatus(Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    ERROR = "error"
    MAINTENANCE = "maintenance"
    CALIBRATING = "calibrating"

@dataclass
class SensorDevice:
    device_id: str
    name: str
    sensor_type: SensorType
    protocol: ProtocolType
    location: str
    manufacturer: str
    model: str
    firmware_version: str
    status: DeviceStatus
    last_seen: datetime
    configuration: Dict[str, Any]
    calibration_data: Dict[str, Any]
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class SensorReading:
    device_id: str
    sensor_type: SensorType
    timestamp: datetime
    value: float
    unit: str
    quality: float  # 0.0 to 1.0
    location: str
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}

@dataclass
class AlertRule:
    rule_id: str
    device_id: str
    sensor_type: SensorType
    condition: str  # "greater_than", "less_than", "equals", "range"
    threshold_value: float
    threshold_max: Optional[float] = None
    severity: str = "warning"  # "info", "warning", "critical"
    enabled: bool = True
    notification_channels: List[str] = None
    
    def __post_init__(self):
        if self.notification_channels is None:
            self.notification_channels = []

class MQTTSensorClient:
    """MQTT client for sensor data collection"""
    
    def __init__(self, broker_host: str, broker_port: int = 1883, 
                 username: Optional[str] = None, password: Optional[str] = None):
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.client = mqtt.Client()
        self.connected = False
        self.message_handlers = {}
        
        if username and password:
            self.client.username_pw_set(username, password)
        
        self.client.on_connect = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message = self._on_message
    
    async def connect(self):
        """Connect to MQTT broker"""
        try:
            self.client.connect(self.broker_host, self.broker_port, 60)
            self.client.loop_start()
            logger.info(f"Connected to MQTT broker at {self.broker_host}:{self.broker_port}")
        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            raise
    
    def _on_connect(self, client, userdata, flags, rc):
        """Callback for MQTT connection"""
        if rc == 0:
            self.connected = True
            logger.info("MQTT client connected successfully")
        else:
            logger.error(f"MQTT connection failed with code {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        """Callback for MQTT disconnection"""
        self.connected = False
        logger.warning("MQTT client disconnected")
    
    def _on_message(self, client, userdata, msg):
        """Callback for MQTT message reception"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            
            # Route message to appropriate handler
            for pattern, handler in self.message_handlers.items():
                if pattern in topic:
                    asyncio.create_task(handler(topic, payload))
                    break
        except Exception as e:
            logger.error(f"Error processing MQTT message: {e}")
    
    def subscribe_to_sensors(self, topic_pattern: str, handler: Callable):
        """Subscribe to sensor topics"""
        self.client.subscribe(topic_pattern)
        self.message_handlers[topic_pattern] = handler
        logger.info(f"Subscribed to MQTT topic: {topic_pattern}")
    
    def publish_command(self, topic: str, command: Dict[str, Any]):
        """Publish command to device"""
        if self.connected:
            self.client.publish(topic, json.dumps(command))
            logger.debug(f"Published command to {topic}: {command}")

class EdgeComputingEngine:
    """Edge computing for local data processing and decision making"""
    
    def __init__(self):
        self.processing_rules = {}
        self.local_cache = {}
        self.alert_rules = {}
        self.data_filters = {}
    
    async def process_sensor_data(self, reading: SensorReading) -> Dict[str, Any]:
        """Process sensor data at the edge"""
        start_time = datetime.now()
        
        # Apply data filtering
        filtered_reading = await self._apply_data_filters(reading)
        if not filtered_reading:
            return {"action": "filtered", "reason": "data_quality"}
        
        # Check alert conditions
        alerts = await self._check_alert_conditions(filtered_reading)
        
        # Apply processing rules
        processed_data = await self._apply_processing_rules(filtered_reading)
        
        # Cache data locally
        await self._cache_data_locally(filtered_reading)
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return {
            "device_id": reading.device_id,
            "processed_value": processed_data.get("value", reading.value),
            "alerts": alerts,
            "processing_time_ms": processing_time,
            "edge_processed": True,
            "timestamp": reading.timestamp.isoformat()
        }
    
    async def _apply_data_filters(self, reading: SensorReading) -> Optional[SensorReading]:
        """Apply data quality filters"""
        # Quality threshold filter
        if reading.quality < 0.7:
            logger.warning(f"Low quality reading from {reading.device_id}: {reading.quality}")
            return None
        
        # Range validation filter
        sensor_ranges = {
            SensorType.TEMPERATURE: (-50, 150),  # Celsius
            SensorType.HUMIDITY: (0, 100),       # Percentage
            SensorType.PRESSURE: (0, 10000),     # kPa
        }
        
        if reading.sensor_type in sensor_ranges:
            min_val, max_val = sensor_ranges[reading.sensor_type]
            if not (min_val <= reading.value <= max_val):
                logger.warning(f"Out of range reading from {reading.device_id}: {reading.value}")
                return None
        
        # Noise reduction filter
        if reading.device_id in self.local_cache:
            previous_readings = self.local_cache[reading.device_id][-5:]  # Last 5 readings
            if len(previous_readings) >= 3:
                values = [r.value for r in previous_readings]
                median_value = np.median(values)
                std_dev = np.std(values)
                
                # Filter out readings that are more than 3 standard deviations from median
                if abs(reading.value - median_value) > 3 * std_dev:
                    logger.warning(f"Outlier reading filtered from {reading.device_id}: {reading.value}")
                    return None
        
        return reading
    
    async def _check_alert_conditions(self, reading: SensorReading) -> List[Dict[str, Any]]:
        """Check if reading triggers any alerts"""
        alerts = []
        
        for rule_id, rule in self.alert_rules.items():
            if rule.device_id != reading.device_id or rule.sensor_type != reading.sensor_type:
                continue
            
            if not rule.enabled:
                continue
            
            triggered = False
            
            if rule.condition == "greater_than" and reading.value > rule.threshold_value:
                triggered = True
            elif rule.condition == "less_than" and reading.value < rule.threshold_value:
                triggered = True
            elif rule.condition == "equals" and abs(reading.value - rule.threshold_value) < 0.001:
                triggered = True
            elif rule.condition == "range" and rule.threshold_max:
                if not (rule.threshold_value <= reading.value <= rule.threshold_max):
                    triggered = True
            
            if triggered:
                alert = {
                    "rule_id": rule_id,
                    "device_id": reading.device_id,
                    "sensor_type": reading.sensor_type.value,
                    "severity": rule.severity,
                    "message": f"{reading.sensor_type.value} value {reading.value} {rule.condition} {rule.threshold_value}",
                    "timestamp": reading.timestamp.isoformat(),
                    "value": reading.value,
                    "threshold": rule.threshold_value
                }
                alerts.append(alert)
                logger.warning(f"Alert triggered: {alert['message']}")
        
        return alerts
    
    async def _apply_processing_rules(self, reading: SensorReading) -> Dict[str, Any]:
        """Apply edge processing rules"""
        processed_data = {"value": reading.value}
        
        # Apply smoothing for noisy sensors
        if reading.sensor_type in [SensorType.VIBRATION, SensorType.SOUND]:
            if reading.device_id in self.local_cache:
                recent_readings = self.local_cache[reading.device_id][-10:]
                if len(recent_readings) >= 5:
                    values = [r.value for r in recent_readings] + [reading.value]
                    smoothed_value = np.mean(values[-5:])  # Moving average
                    processed_data["value"] = smoothed_value
                    processed_data["smoothed"] = True
        
        # Apply calibration corrections
        if reading.device_id in self.processing_rules:
            rules = self.processing_rules[reading.device_id]
            if "calibration_offset" in rules:
                processed_data["value"] += rules["calibration_offset"]
            if "calibration_scale" in rules:
                processed_data["value"] *= rules["calibration_scale"]
        
        return processed_data
    
    async def _cache_data_locally(self, reading: SensorReading):
        """Cache data locally for edge processing"""
        if reading.device_id not in self.local_cache:
            self.local_cache[reading.device_id] = []
        
        self.local_cache[reading.device_id].append(reading)
        
        # Keep only last 100 readings per device
        if len(self.local_cache[reading.device_id]) > 100:
            self.local_cache[reading.device_id] = self.local_cache[reading.device_id][-100:]
    
    def add_alert_rule(self, rule: AlertRule):
        """Add new alert rule"""
        self.alert_rules[rule.rule_id] = rule
        logger.info(f"Added alert rule: {rule.rule_id}")
    
    def add_processing_rule(self, device_id: str, rules: Dict[str, Any]):
        """Add processing rules for device"""
        self.processing_rules[device_id] = rules
        logger.info(f"Added processing rules for device: {device_id}")

class TimeSeriesDataManager:
    """Time series data storage and retrieval using InfluxDB"""
    
    def __init__(self, influx_url: str, token: str, org: str, bucket: str):
        self.client = InfluxDBClient(url=influx_url, token=token, org=org)
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.query_api = self.client.query_api()
        self.bucket = bucket
        self.org = org
    
    async def store_sensor_reading(self, reading: SensorReading):
        """Store sensor reading in time series database"""
        try:
            point = Point("sensor_data") \
                .tag("device_id", reading.device_id) \
                .tag("sensor_type", reading.sensor_type.value) \
                .tag("location", reading.location) \
                .field("value", reading.value) \
                .field("quality", reading.quality) \
                .field("unit", reading.unit) \
                .time(reading.timestamp)
            
            # Add metadata as tags
            for key, value in reading.metadata.items():
                point = point.tag(f"meta_{key}", str(value))
            
            self.write_api.write(bucket=self.bucket, org=self.org, record=point)
            
        except Exception as e:
            logger.error(f"Error storing sensor reading: {e}")
    
    async def query_sensor_data(self, device_id: str, start_time: datetime, 
                              end_time: datetime, aggregation: str = "mean", 
                              window: str = "1m") -> List[Dict[str, Any]]:
        """Query sensor data with aggregation"""
        try:
            query = f'''
            from(bucket: "{self.bucket}")
                |> range(start: {start_time.isoformat()}, stop: {end_time.isoformat()})
                |> filter(fn: (r) => r["_measurement"] == "sensor_data")
                |> filter(fn: (r) => r["device_id"] == "{device_id}")
                |> filter(fn: (r) => r["_field"] == "value")
                |> aggregateWindow(every: {window}, fn: {aggregation}, createEmpty: false)
                |> yield(name: "{aggregation}")
            '''
            
            result = self.query_api.query(org=self.org, query=query)
            
            data = []
            for table in result:
                for record in table.records:
                    data.append({
                        "timestamp": record.get_time().isoformat(),
                        "value": record.get_value(),
                        "device_id": record.values.get("device_id"),
                        "sensor_type": record.values.get("sensor_type")
                    })
            
            return data
            
        except Exception as e:
            logger.error(f"Error querying sensor data: {e}")
            return []

class DeviceManager:
    """IoT device management and configuration"""
    
    def __init__(self):
        self.devices = {}
        self.device_configurations = {}
        self.firmware_versions = {}
    
    async def register_device(self, device: SensorDevice):
        """Register new IoT device"""
        self.devices[device.device_id] = device
        logger.info(f"Registered device: {device.name} ({device.device_id})")
    
    async def update_device_status(self, device_id: str, status: DeviceStatus):
        """Update device status"""
        if device_id in self.devices:
            self.devices[device_id].status = status
            self.devices[device_id].last_seen = datetime.now(timezone.utc)
            logger.info(f"Updated device {device_id} status to {status.value}")
    
    async def configure_device(self, device_id: str, configuration: Dict[str, Any]):
        """Configure device parameters"""
        if device_id in self.devices:
            self.devices[device_id].configuration.update(configuration)
            self.device_configurations[device_id] = configuration
            logger.info(f"Updated configuration for device {device_id}")
    
    async def calibrate_device(self, device_id: str, calibration_data: Dict[str, Any]):
        """Calibrate device sensors"""
        if device_id in self.devices:
            self.devices[device_id].calibration_data.update(calibration_data)
            logger.info(f"Calibrated device {device_id}")
    
    async def get_device_health(self, device_id: str) -> Dict[str, Any]:
        """Get device health status"""
        if device_id not in self.devices:
            return {"error": "Device not found"}
        
        device = self.devices[device_id]
        last_seen_minutes = (datetime.now(timezone.utc) - device.last_seen).total_seconds() / 60
        
        health_status = "healthy"
        if last_seen_minutes > 60:  # No data for over 1 hour
            health_status = "offline"
        elif last_seen_minutes > 15:  # No data for over 15 minutes
            health_status = "warning"
        
        return {
            "device_id": device_id,
            "status": device.status.value,
            "health_status": health_status,
            "last_seen": device.last_seen.isoformat(),
            "last_seen_minutes": last_seen_minutes,
            "firmware_version": device.firmware_version,
            "location": device.location
        }

class IoTIntegrationHub:
    """Main IoT integration hub orchestrator"""
    
    def __init__(self, mqtt_config: Dict[str, Any], influx_config: Dict[str, Any]):
        self.device_manager = DeviceManager()
        self.edge_engine = EdgeComputingEngine()
        self.mqtt_client = MQTTSensorClient(**mqtt_config)
        self.time_series_db = TimeSeriesDataManager(**influx_config)
        self.redis_client = redis.Redis(host='localhost', port=6379, db=1)
        
    async def initialize(self):
        """Initialize IoT integration hub"""
        await self.mqtt_client.connect()
        
        # Subscribe to sensor data topics
        self.mqtt_client.subscribe_to_sensors("sensors/+/data", self._handle_sensor_data)
        self.mqtt_client.subscribe_to_sensors("devices/+/status", self._handle_device_status)
        
        logger.info("IoT Integration Hub initialized successfully")
    
    async def _handle_sensor_data(self, topic: str, payload: Dict[str, Any]):
        """Handle incoming sensor data"""
        try:
            # Parse sensor reading
            reading = SensorReading(
                device_id=payload["device_id"],
                sensor_type=SensorType(payload["sensor_type"]),
                timestamp=datetime.fromisoformat(payload["timestamp"]),
                value=float(payload["value"]),
                unit=payload["unit"],
                quality=float(payload.get("quality", 1.0)),
                location=payload.get("location", "unknown"),
                metadata=payload.get("metadata", {})
            )
            
            # Process at edge
            edge_result = await self.edge_engine.process_sensor_data(reading)
            
            # Store in time series database
            await self.time_series_db.store_sensor_reading(reading)
            
            # Cache latest reading in Redis
            self.redis_client.setex(
                f"sensor:latest:{reading.device_id}",
                300,  # 5 minutes TTL
                json.dumps(asdict(reading), default=str)
            )
            
            # Handle alerts
            if edge_result.get("alerts"):
                await self._handle_alerts(edge_result["alerts"])
            
        except Exception as e:
            logger.error(f"Error handling sensor data: {e}")
    
    async def _handle_device_status(self, topic: str, payload: Dict[str, Any]):
        """Handle device status updates"""
        try:
            device_id = payload["device_id"]
            status = DeviceStatus(payload["status"])
            
            await self.device_manager.update_device_status(device_id, status)
            
        except Exception as e:
            logger.error(f"Error handling device status: {e}")
    
    async def _handle_alerts(self, alerts: List[Dict[str, Any]]):
        """Handle sensor alerts"""
        for alert in alerts:
            # Store alert in Redis
            alert_key = f"alert:{alert['device_id']}:{alert['rule_id']}"
            self.redis_client.setex(alert_key, 3600, json.dumps(alert))
            
            # Publish alert to notification system
            self.mqtt_client.publish_command("alerts/sensor", alert)
            
            logger.warning(f"Sensor alert: {alert['message']}")
    
    async def get_real_time_dashboard_data(self) -> Dict[str, Any]:
        """Get real-time data for IoT dashboard"""
        dashboard_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_devices": len(self.device_manager.devices),
            "online_devices": 0,
            "offline_devices": 0,
            "recent_alerts": [],
            "sensor_summary": {}
        }
        
        # Count device statuses
        for device in self.device_manager.devices.values():
            if device.status == DeviceStatus.ONLINE:
                dashboard_data["online_devices"] += 1
            else:
                dashboard_data["offline_devices"] += 1
        
        # Get recent alerts
        alert_keys = self.redis_client.keys("alert:*")
        for key in alert_keys[-10:]:  # Last 10 alerts
            alert_data = self.redis_client.get(key)
            if alert_data:
                dashboard_data["recent_alerts"].append(json.loads(alert_data))
        
        # Get sensor type summary
        sensor_types = {}
        for device in self.device_manager.devices.values():
            sensor_type = device.sensor_type.value
            if sensor_type not in sensor_types:
                sensor_types[sensor_type] = 0
            sensor_types[sensor_type] += 1
        
        dashboard_data["sensor_summary"] = sensor_types
        
        return dashboard_data

# Global IoT integration hub instance
iot_hub = None

async def initialize_iot_hub(mqtt_config: Dict[str, Any], influx_config: Dict[str, Any]):
    """Initialize global IoT hub"""
    global iot_hub
    iot_hub = IoTIntegrationHub(mqtt_config, influx_config)
    await iot_hub.initialize()
    return iot_hub
