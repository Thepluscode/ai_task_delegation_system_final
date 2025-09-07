"""
Core functionality for the AI Automation Platform.

This module provides essential utilities and services including:
- Configuration management
- Error recovery and circuit breaking
- Monitoring and observability
- Security and authentication
- Database access and ORM
- Caching and performance optimization
- Common utilities
"""

# Core components
from .config import settings, get_settings
from .error_recovery import (
    RetryableError,
    NonRetryableError,
    create_circuit_breaker,
    async_retry,
    DeadLetterQueue,
    dead_letter_queue,
)
from .monitoring import (
    init_metrics,
    init_tracing,
    MetricsMiddleware,
    TaskMetrics,
    trace_function,
    create_health_router,
)
from .security import (
    Token,
    TokenData,
    User,
    UserInDB,
    get_current_user,
    verify_password,
    get_password_hash,
    create_access_token,
    DataEncryption,
    setup_security,
    RateLimitMiddleware,
)
from .database import (
    Base,
    get_db,
    init_db,
    close_db,
    BatchProcessor,
    DatabaseUtils,
)
from .caching import (
    CacheManager,
    CacheKey,
    cached,
    cache,
    CacheInvalidationStrategy,
    TimeBasedInvalidation,
    TagBasedInvalidation,
    WriteThroughInvalidation,
    WriteBehindInvalidation,
    init_cache,
    close_cache,
)
from .utils import (
    generate_id,
    get_timestamp,
    to_camel_case,
    to_snake_case,
    dict_to_camel_case,
    dict_to_snake_case,
    run_in_threadpool,
    Timer,
    gather_with_concurrency,
    chunked,
    Singleton,
    LRUCache,
    RateLimiter,
    ExpiringDict,
)

__all__ = [
    # Config
    'settings',
    'get_settings',
    
    # Error recovery
    'RetryableError',
    'NonRetryableError',
    'create_circuit_breaker',
    'async_retry',
    'DeadLetterQueue',
    'dead_letter_queue',
    
    # Monitoring
    'init_metrics',
    'init_tracing',
    'MetricsMiddleware',
    'TaskMetrics',
    'trace_function',
    'create_health_router',
    
    # Security
    'Token',
    'TokenData',
    'User',
    'UserInDB',
    'get_current_user',
    'verify_password',
    'get_password_hash',
    'create_access_token',
    'DataEncryption',
    'setup_security',
    'RateLimitMiddleware',
    
    # Database
    'Base',
    'get_db',
    'init_db',
    'close_db',
    'BatchProcessor',
    'DatabaseUtils',
    
    # Caching
    'CacheManager',
    'CacheKey',
    'cached',
    'cache',
    'CacheInvalidationStrategy',
    'TimeBasedInvalidation',
    'TagBasedInvalidation',
    'WriteThroughInvalidation',
    'WriteBehindInvalidation',
    'init_cache',
    'close_cache',
    
    # Utils
    'generate_id',
    'get_timestamp',
    'to_camel_case',
    'to_snake_case',
    'dict_to_camel_case',
    'dict_to_snake_case',
    'run_in_threadpool',
    'Timer',
    'gather_with_concurrency',
    'chunked',
    'Singleton',
    'LRUCache',
    'RateLimiter',
    'ExpiringDict',
]
