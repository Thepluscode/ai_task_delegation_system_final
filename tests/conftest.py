#!/usr/bin/env python3
"""
Pytest Configuration and Fixtures
Global test configuration for the enhanced automation platform
"""

import pytest
import asyncio
import logging
import sys
import os
from unittest.mock import Mock, patch

# Add the services directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'services', 'enhanced-robot-control-service'))

# Configure logging for tests
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Disable verbose logging during tests
logging.getLogger('asyncio').setLevel(logging.WARNING)
logging.getLogger('urllib3').setLevel(logging.WARNING)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def mock_redis():
    """Mock Redis client for testing"""
    with patch('aioredis.from_url') as mock:
        mock_client = Mock()
        mock_client.get = Mock(return_value=None)
        mock_client.set = Mock(return_value=True)
        mock_client.delete = Mock(return_value=True)
        mock.return_value = mock_client
        yield mock_client

@pytest.fixture
def mock_database():
    """Mock database session for testing"""
    with patch('sqlalchemy.create_engine') as mock_engine, \
         patch('sqlalchemy.orm.sessionmaker') as mock_session:
        
        mock_db = Mock()
        mock_db.query = Mock()
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.rollback = Mock()
        mock_db.close = Mock()
        
        mock_session.return_value = lambda: mock_db
        yield mock_db

@pytest.fixture
def mock_ros_interface():
    """Mock ROS interface for PAL Robotics testing"""
    with patch('rospy.init_node') as mock_init, \
         patch('rospy.Publisher') as mock_pub, \
         patch('rospy.Subscriber') as mock_sub:
        
        mock_publisher = Mock()
        mock_publisher.publish = Mock()
        mock_pub.return_value = mock_publisher
        
        mock_subscriber = Mock()
        mock_sub.return_value = mock_subscriber
        
        yield {
            'init_node': mock_init,
            'publisher': mock_publisher,
            'subscriber': mock_subscriber
        }

@pytest.fixture
def sample_sensor_data():
    """Sample sensor data for testing"""
    return {
        "cameras": {
            "camera_001": {"humans_detected": 1, "objects_detected": 3},
            "camera_002": {"humans_detected": 0, "objects_detected": 2}
        },
        "proximity_sensors": {
            "proximity_001": {"distance": 1.2, "object_type": "human"},
            "proximity_002": {"distance": 0.5, "object_type": "wall"}
        },
        "environmental": {
            "temperature": 23.5,
            "humidity": 45.0,
            "air_quality": 0.92,
            "noise_level": 38.0
        },
        "system_health": {
            "cpu_usage": 0.45,
            "memory_usage": 0.62,
            "network_latency": 12.0,
            "error_rate": 0.01
        }
    }

@pytest.fixture
def sample_robot_positions():
    """Sample robot positions for testing"""
    return {
        "tiago_001": {"x": 2.5, "y": 1.8, "z": 0.0, "heading": 90.0},
        "ur5_001": {"x": 5.0, "y": 3.0, "z": 0.8, "heading": 0.0},
        "generic_001": {"x": 8.2, "y": 4.5, "z": 0.0, "heading": 180.0}
    }

@pytest.fixture
def performance_thresholds():
    """Performance thresholds for testing"""
    return {
        "edge_decision_latency_ms": 10.0,
        "safety_monitoring_response_ms": 5.0,
        "agent_coordination_time_ms": 100.0,
        "device_command_latency_ms": 50.0,
        "system_startup_time_ms": 1000.0,
        "throughput_decisions_per_sec": 1000.0,
        "memory_increase_limit_mb": 50.0
    }

@pytest.fixture
def test_configuration():
    """Test configuration settings"""
    return {
        "test_mode": True,
        "mock_hardware": True,
        "enable_logging": True,
        "performance_testing": True,
        "safety_testing": True,
        "integration_testing": True,
        "load_testing": False,  # Disabled by default for faster tests
        "stress_testing": False  # Disabled by default
    }

# Pytest markers for test categorization
def pytest_configure(config):
    """Configure pytest markers"""
    config.addinivalue_line(
        "markers", "unit: mark test as a unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "performance: mark test as a performance test"
    )
    config.addinivalue_line(
        "markers", "safety: mark test as a safety test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "edge: mark test as edge computing related"
    )
    config.addinivalue_line(
        "markers", "cloud: mark test as cloud computing related"
    )
    config.addinivalue_line(
        "markers", "hybrid: mark test as edge-cloud hybrid related"
    )

def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers based on test names"""
    for item in items:
        # Add markers based on test file names
        if "performance" in item.nodeid:
            item.add_marker(pytest.mark.performance)
        if "safety" in item.nodeid:
            item.add_marker(pytest.mark.safety)
        if "integration" in item.nodeid:
            item.add_marker(pytest.mark.integration)
        if "edge" in item.nodeid:
            item.add_marker(pytest.mark.edge)
        
        # Add slow marker for performance and integration tests
        if any(marker in item.nodeid for marker in ["performance", "integration", "end_to_end"]):
            item.add_marker(pytest.mark.slow)

# Test data cleanup
@pytest.fixture(autouse=True)
def cleanup_test_data():
    """Automatically cleanup test data after each test"""
    yield
    # Cleanup code would go here in a real implementation
    # For example: clear test databases, reset mock states, etc.
    pass

# Mock external dependencies
@pytest.fixture(autouse=True)
def mock_external_services():
    """Mock external services for testing"""
    with patch('requests.get') as mock_get, \
         patch('requests.post') as mock_post:
        
        # Mock successful HTTP responses
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"status": "success"}
        mock_response.text = "OK"
        
        mock_get.return_value = mock_response
        mock_post.return_value = mock_response
        
        yield {
            'get': mock_get,
            'post': mock_post,
            'response': mock_response
        }

# Performance monitoring fixture
@pytest.fixture
def performance_monitor():
    """Performance monitoring for tests"""
    import time
    import psutil
    
    class PerformanceMonitor:
        def __init__(self):
            self.start_time = None
            self.start_memory = None
            self.process = psutil.Process()
        
        def start(self):
            self.start_time = time.perf_counter()
            self.start_memory = self.process.memory_info().rss / 1024 / 1024  # MB
        
        def stop(self):
            if self.start_time is None:
                return None
            
            end_time = time.perf_counter()
            end_memory = self.process.memory_info().rss / 1024 / 1024  # MB
            
            return {
                "execution_time_ms": (end_time - self.start_time) * 1000,
                "memory_increase_mb": end_memory - self.start_memory,
                "start_memory_mb": self.start_memory,
                "end_memory_mb": end_memory
            }
    
    return PerformanceMonitor()

# Async test utilities
@pytest.fixture
def async_test_timeout():
    """Default timeout for async tests"""
    return 30.0  # 30 seconds

# Test result collector
@pytest.fixture(scope="session")
def test_results():
    """Collect test results for reporting"""
    results = {
        "passed": 0,
        "failed": 0,
        "skipped": 0,
        "performance_metrics": [],
        "safety_events": [],
        "integration_results": []
    }
    yield results

# Pytest hooks for result collection
def pytest_runtest_logreport(report):
    """Collect test results"""
    if report.when == "call":
        if report.outcome == "passed":
            # Test passed
            pass
        elif report.outcome == "failed":
            # Test failed
            pass
        elif report.outcome == "skipped":
            # Test skipped
            pass

# Custom assertions for automation testing
class AutomationAssertions:
    """Custom assertions for automation platform testing"""
    
    @staticmethod
    def assert_latency_target(actual_ms, target_ms, tolerance_percent=10):
        """Assert latency meets target with tolerance"""
        tolerance = target_ms * (tolerance_percent / 100)
        assert actual_ms <= target_ms + tolerance, \
            f"Latency {actual_ms:.2f}ms exceeds target {target_ms}ms (±{tolerance_percent}%)"
    
    @staticmethod
    def assert_throughput_target(actual_ops_per_sec, target_ops_per_sec, tolerance_percent=10):
        """Assert throughput meets target with tolerance"""
        tolerance = target_ops_per_sec * (tolerance_percent / 100)
        assert actual_ops_per_sec >= target_ops_per_sec - tolerance, \
            f"Throughput {actual_ops_per_sec:.1f} ops/sec below target {target_ops_per_sec} (±{tolerance_percent}%)"
    
    @staticmethod
    def assert_safety_score(score, minimum_score=0.7):
        """Assert safety score meets minimum requirements"""
        assert 0.0 <= score <= 1.0, f"Safety score {score} not in valid range [0.0, 1.0]"
        assert score >= minimum_score, f"Safety score {score} below minimum {minimum_score}"
    
    @staticmethod
    def assert_agent_coordination(coordination_result):
        """Assert agent coordination result is valid"""
        assert isinstance(coordination_result, dict), "Coordination result must be a dictionary"
        required_keys = ["tasks_processed", "agents_coordinated"]
        for key in required_keys:
            assert key in coordination_result, f"Missing required key: {key}"
            assert isinstance(coordination_result[key], int), f"{key} must be an integer"
            assert coordination_result[key] >= 0, f"{key} must be non-negative"

@pytest.fixture
def automation_assertions():
    """Provide custom automation assertions"""
    return AutomationAssertions()

# Test environment setup
@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup test environment"""
    print("\n" + "="*70)
    print("ENHANCED AUTOMATION PLATFORM - TEST SUITE")
    print("="*70)
    print("🧪 Initializing test environment...")
    print("🔧 Edge AI Engine tests")
    print("🤖 Agent Coordination tests")
    print("🛡️ Safety Monitoring tests")
    print("🔌 Device Abstraction tests")
    print("⚡ Performance Benchmarks")
    print("🔄 End-to-End Integration tests")
    print("="*70)
    
    yield
    
    print("\n" + "="*70)
    print("✅ TEST SUITE COMPLETED")
    print("="*70)
