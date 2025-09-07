# ai_automation_platform/sensors/__init__.py
from .base_sensor import BaseSensor
from .base_driver import BaseDriver
from .sensor_manager import SensorManager
"""Sensor and driver infrastructure for the AI Automation Platform.

This module provides the core abstractions and implementations for working with sensors and drivers:

- Base classes: Abstract base classes for sensors and drivers
- Implementations: Concrete sensor and driver implementations
- Event handling: System for handling sensor and driver events
- Configuration: Types for configuring sensors and drivers
"""

from .base_sensor import (
    BaseSensor,
    SensorConfig,
    SensorReading,
    SensorEvent,
    SensorEventType,
    SensorState
)
from .base_driver import (
    BaseDriver,
    DriverConfig,
    DriverEvent,
    DriverEventType
)

# DHT22 Implementation
from .dht22_sensor import DHT22Sensor, DHT22SensorConfig, DHT22Reading
from .drivers.dht22_driver import DHT22Driver, DHT22Config

__all__ = [
    # Base classes
    'BaseSensor',
    'BaseDriver',
    
    # Configurations
    'SensorConfig',
    'DriverConfig',
    
    # Events
    'SensorEvent',
    'DriverEvent',
    'SensorEventType',
    'DriverEventType',
    
    # Enums and types
    'SensorState',
    'SensorReading',
    
    # DHT22 Implementation
    'DHT22Sensor',
    'DHT22SensorConfig',
    'DHT22Reading',
    'DHT22Driver',
    'DHT22Config',
    'SensorConfig'
]