import asyncio
import hashlib
import inspect
import json
import logging
import os
import random
import string
import time
from collections import defaultdict
from datetime import datetime, timezone
from functools import wraps
from typing import Any, AsyncGenerator, Awaitable, Callable, Dict, List, Optional, ParamSpec, Type, TypeVar, Union, cast

from pydantic import BaseModel

from .config import settings

logger = logging.getLogger(__name__)

# Type variables
T = TypeVar('T')
P = ParamSpec('P')
R = TypeVar('R')

def generate_id(prefix: str = '', length: int = 16) -> str:
    """Generate a random ID with an optional prefix."""
    chars = string.ascii_letters + string.digits
    random_str = ''.join(random.choices(chars, k=length))
    return f"{prefix}_{random_str}" if prefix else random_str

def get_timestamp() -> int:
    """Get current UTC timestamp in milliseconds."""
    return int(datetime.now(timezone.utc).timestamp() * 1000)

def to_camel_case(snake_str: str) -> str:
    """Convert snake_case to camelCase."""
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def to_snake_case(camel_str: str) -> str:
    """Convert camelCase to snake_case."""
    return ''.join(['_' + c.lower() if c.isupper() else c for c in camel_str]).lstrip('_')

def dict_to_camel_case(d: Dict[str, Any]) -> Dict[str, Any]:
    """Convert all keys in a dictionary to camelCase."""
    return {to_camel_case(k): v for k, v in d.items()}

def dict_to_snake_case(d: Dict[str, Any]) -> Dict[str, Any]:
    """Convert all keys in a dictionary to snake_case."""
    return {to_snake_case(k): v for k, v in d.items()}

async def run_in_threadpool(func: Callable[P, R], *args: P.args, **kwargs: P.kwargs) -> R:
    """Run a synchronous function in a thread pool."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, lambda: func(*args, **kwargs))

def async_retry(
    max_retries: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (Exception,),
):
    """Decorator for adding retry logic to async functions."""
    def decorator(func: Callable[P, Awaitable[R]]) -> Callable[P, Awaitable[R]]:
        @wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            retries = 0
            current_delay = delay
            
            while True:
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    retries += 1
                    if retries > max_retries:
                        logger.error(
                            f"Max retries ({max_retries}) exceeded for {func.__name__}",
                            exc_info=True,
                        )
                        raise
                    
                    logger.warning(
                        f"Retry {retries}/{max_retries} for {func.__name__} "
                        f"after error: {str(e)}"
                    )
                    
                    await asyncio.sleep(current_delay)
                    current_delay *= backoff
        
        return wrapper
    return decorator

class Timer:
    """Context manager for timing code blocks."""
    
    def __init__(self, name: str = None):
        self.name = name or "Code block"
        self.start_time = None
        self.end_time = None
    
    def __enter__(self):
        self.start_time = time.perf_counter()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.perf_counter()
        elapsed = self.end_time - self.start_time
        logger.info(f"{self.name} took {elapsed:.4f} seconds")
        return False

async def gather_with_concurrency(
    n: int, 
    *tasks: Awaitable[T],
    return_exceptions: bool = False
) -> List[T]:
    """Run coroutines with limited concurrency."""
    semaphore = asyncio.Semaphore(n)
    
    async def sem_task(task: Awaitable[T]) -> T:
        async with semaphore:
            return await task
    
    return await asyncio.gather(
        *(sem_task(task) for task in tasks),
        return_exceptions=return_exceptions
    )

def chunked(iterable, size):
    """Split an iterable into chunks of the given size."""
    it = iter(iterable)
    while True:
        chunk = list(itertools.islice(it, size))
        if not chunk:
            break
        yield chunk

class Singleton(type):
    """Singleton metaclass."""
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class LRUCache:
    """Least Recently Used (LRU) cache implementation."""
    
    def __init__(self, max_size: int = 1000):
        self.cache = {}
        self.max_size = max_size
        self.order = []
    
    def get(self, key: Any) -> Any:
        """Get a value from the cache."""
        if key in self.cache:
            self.order.remove(key)
            self.order.append(key)
            return self.cache[key]
        return None
    
    def set(self, key: Any, value: Any) -> None:
        """Set a value in the cache."""
        if key in self.cache:
            self.order.remove(key)
        elif len(self.cache) >= self.max_size:
            oldest = self.order.pop(0)
            del self.cache[oldest]
        
        self.cache[key] = value
        self.order.append(key)
    
    def delete(self, key: Any) -> bool:
        """Delete a value from the cache."""
        if key in self.cache:
            del self.cache[key]
            self.order.remove(key)
            return True
        return False
    
    def clear(self) -> None:
        """Clear the cache."""
        self.cache.clear()
        self.order.clear()

class RateLimiter:
    """Simple rate limiter using token bucket algorithm."""
    
    def __init__(self, rate: float, capacity: int):
        """
        Initialize rate limiter.
        
        Args:
            rate: Number of tokens added per second
            capacity: Maximum number of tokens in the bucket
        """
        self.rate = rate
        self.capacity = capacity
        self.tokens = capacity
        self.last_update = time.time()
        self.lock = asyncio.Lock()
    
    async def acquire(self, tokens: int = 1) -> bool:
        """
        Acquire tokens from the bucket.
        
        Args:
            tokens: Number of tokens to acquire
            
        Returns:
            bool: True if tokens were acquired, False otherwise
        """
        async with self.lock:
            now = time.time()
            time_passed = now - self.last_update
            self.last_update = now
            
            # Add tokens based on time passed
            self.tokens += time_passed * self.rate
            if self.tokens > self.capacity:
                self.tokens = self.capacity
            
            # Check if we have enough tokens
            if tokens <= self.tokens:
                self.tokens -= tokens
                return True
            
            return False
    
    async def wait(self, tokens: int = 1) -> None:
        """
        Wait until tokens are available.
        
        Args:
            tokens: Number of tokens to acquire
        """
        while not await self.acquire(tokens):
            await asyncio.sleep(0.1)

class ExpiringDict:
    """Dictionary with expiring values."""
    
    def __init__(self, default_ttl: float = 60.0):
        """
        Initialize expiring dictionary.
        
        Args:
            default_ttl: Default time to live in seconds
        """
        self.store = {}
        self.default_ttl = default_ttl
    
    def __getitem__(self, key: Any) -> Any:
        """Get a value from the dictionary."""
        value, expiry = self.store[key]
        if time.time() > expiry:
            del self.store[key]
            raise KeyError(key)
        return value
    
    def __setitem__(self, key: Any, value: Any) -> None:
        """Set a value in the dictionary with default TTL."""
        self.set(key, value, self.default_ttl)
    
    def __delitem__(self, key: Any) -> None:
        """Delete a value from the dictionary."""
        del self.store[key]
    
    def __contains__(self, key: Any) -> bool:
        """Check if key exists and is not expired."""
        try:
            self[key]  # This will handle expiration
            return True
        except KeyError:
            return False
    
    def set(self, key: Any, value: Any, ttl: float = None) -> None:
        """
        Set a value with a specific TTL.
        
        Args:
            key: Key to set
            value: Value to store
            ttl: Time to live in seconds (defaults to default_ttl)
        """
        if ttl is None:
            ttl = self.default_ttl
        self.store[key] = (value, time.time() + ttl)
    
    def get(self, key: Any, default: Any = None) -> Any:
        """Get a value with a default if not found or expired."""
        try:
            return self[key]
        except KeyError:
            return default
    
    def cleanup(self) -> None:
        """Remove all expired items."""
        now = time.time()
        expired_keys = [k for k, (_, expiry) in self.store.items() if now > expiry]
        for key in expired_keys:
            del self.store[key]
