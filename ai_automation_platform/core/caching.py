import asyncio
import json
import logging
from datetime import datetime, timedelta
from functools import wraps
from typing import Any, Callable, Dict, List, Optional, Tuple, Type, TypeVar, Union, cast

import redis
from pydantic import BaseModel

from .config import settings

logger = logging.getLogger(__name__)

# Type variables
T = TypeVar('T')
R = TypeVar('R')

class CacheKey:
    """Helper class for generating cache keys."""
    
    @staticmethod
    def create(*parts: Any, prefix: str = "", suffix: str = "") -> str:
        """Create a cache key from parts."""
        key_parts = [str(part) for part in parts if part is not None]
        key = ":".join(key_parts)
        
        if prefix:
            key = f"{prefix}:{key}"
        if suffix:
            key = f"{key}:{suffix}"
            
        return key

class CacheBackend:
    """Base class for cache backends."""
    
    async def get(self, key: str) -> Optional[bytes]:
        """Get a value from the cache."""
        raise NotImplementedError
    
    async def set(
        self, 
        key: str, 
        value: bytes, 
        expire: Optional[int] = None
    ) -> None:
        """Set a value in the cache."""
        raise NotImplementedError
    
    async def delete(self, key: str) -> None:
        """Delete a value from the cache."""
        raise NotImplementedError
    
    async def exists(self, key: str) -> bool:
        """Check if a key exists in the cache."""
        raise NotImplementedError
    
    async def expire(self, key: str, ttl: int) -> None:
        """Set a key's time to live in seconds."""
        raise NotImplementedError
    
    async def ttl(self, key: str) -> int:
        """Get a key's time to live in seconds."""
        raise NotImplementedError
    
    async def close(self) -> None:
        """Close the cache connection."""
        pass

class RedisBackend(CacheBackend):
    """Redis cache backend using redis-py."""
    
    def __init__(self, redis_url: str = None):
        """Initialize the Redis backend."""
        self.redis_url = redis_url or settings.REDIS_URL
        self._redis: Optional[redis.Redis] = None
    
    def _get_redis(self) -> redis.Redis:
        """Get a Redis connection."""
        if self._redis is None:
            self._redis = redis.from_url(
                self.redis_url,
                decode_responses=False,
                max_connections=10,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
        return self._redis
    
    async def get(self, key: str) -> Optional[bytes]:
        """Get a value from Redis."""
        redis = self._get_redis()
        return redis.get(key)
    
    async def set(self, key: str, value: bytes, expire: Optional[int] = None) -> None:
        """Set a value in Redis."""
        redis = self._get_redis()
        if expire is not None:
            redis.setex(key, expire, value)
        else:
            redis.set(key, value)
    
    async def delete(self, key: str) -> None:
        """Delete a value from Redis."""
        redis = self._get_redis()
        redis.delete(key)
    
    async def exists(self, key: str) -> bool:
        """Check if a key exists in Redis."""
        redis = self._get_redis()
        return bool(redis.exists(key))
    
    async def expire(self, key: str, ttl: int) -> None:
        """Set a key's time to live in seconds."""
        redis = self._get_redis()
        redis.expire(key, ttl)
    
    async def ttl(self, key: str) -> int:
        """Get a key's time to live in seconds."""
        redis = self._get_redis()
        ttl = redis.ttl(key)
        return ttl if ttl is not None else -1
    
    async def close(self) -> None:
        """Close the Redis connection."""
        if self._redis is not None:
            self._redis.close()
            self._redis = None

class InMemoryBackend(CacheBackend):
    """In-memory cache backend for testing and development."""
    
    def __init__(self):
        """Initialize the in-memory cache."""
        self._cache: Dict[str, Tuple[bytes, Optional[float]]] = {}
    
    async def get(self, key: str) -> Optional[bytes]:
        """Get a value from the in-memory cache."""
        if key not in self._cache:
            return None
            
        value, expiry = self._cache[key]
        if expiry is not None and expiry < datetime.now().timestamp():
            del self._cache[key]
            return None
            
        return value
    
    async def set(
        self, 
        key: str, 
        value: bytes, 
        expire: Optional[int] = None
    ) -> None:
        """Set a value in the in-memory cache."""
        expiry = None
        if expire is not None:
            expiry = datetime.now().timestamp() + expire
        self._cache[key] = (value, expiry)
    
    async def delete(self, key: str) -> None:
        """Delete a value from the in-memory cache."""
        if key in self._cache:
            del self._cache[key]
    
    async def exists(self, key: str) -> bool:
        """Check if a key exists in the in-memory cache."""
        if key not in self._cache:
            return False
            
        _, expiry = self._cache[key]
        if expiry is not None and expiry < datetime.now().timestamp():
            del self._cache[key]
            return False
            
        return True
    
    async def expire(self, key: str, ttl: int) -> None:
        """Set a key's time to live in seconds."""
        if key in self._cache:
            value, _ = self._cache[key]
            expiry = datetime.now().timestamp() + ttl
            self._cache[key] = (value, expiry)
    
    async def ttl(self, key: str) -> int:
        """Get a key's time to live in seconds."""
        if key not in self._cache:
            return -2
            
        _, expiry = self._cache[key]
        if expiry is None:
            return -1
            
        now = datetime.now().timestamp()
        if expiry < now:
            return -2
            
        return int(expiry - now)

class CacheManager:
    """Cache manager with support for multiple backends and invalidation strategies."""
    
    def __init__(self, backend: Optional[CacheBackend] = None):
        """Initialize the cache manager."""
        self.backend = backend or self._get_default_backend()
        self._serializer = json
    
    def _get_default_backend(self) -> CacheBackend:
        """Get the default cache backend based on settings."""
        if settings.CACHE_BACKEND == "redis":
            return RedisBackend()
        return InMemoryBackend()
    
    async def get(
        self, 
        key: str, 
        default: Any = None,
        model: Type[BaseModel] = None
    ) -> Any:
        """Get a value from the cache."""
        try:
            cached = await self.backend.get(key)
            if cached is None:
                return default
                
            data = self._serializer.loads(cached.decode())
            
            if model is not None:
                if isinstance(data, list):
                    return [model.parse_obj(item) for item in data]
                return model.parse_obj(data)
                
            return data
        except Exception as e:
            logger.warning(f"Cache get failed for key {key}: {e}")
            return default
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        expire: Optional[int] = None,
        tags: List[str] = None
    ) -> None:
        """Set a value in the cache."""
        try:
            if hasattr(value, 'dict'):
                value = value.dict()
                
            serialized = self._serializer.dumps(value).encode()
            await self.backend.set(key, serialized, expire=expire)
            
            # Store cache key for each tag
            if tags:
                for tag in tags:
                    tag_key = self._get_tag_key(tag)
                    await self._add_to_tag(tag_key, key, expire)
        except Exception as e:
            logger.warning(f"Cache set failed for key {key}: {e}")
    
    async def delete(self, key: str) -> None:
        """Delete a value from the cache."""
        try:
            await self.backend.delete(key)
        except Exception as e:
            logger.warning(f"Cache delete failed for key {key}: {e}")
    
    async def invalidate_tag(self, tag: str) -> None:
        """Invalidate all cache entries with the given tag."""
        try:
            tag_key = self._get_tag_key(tag)
            cache_keys = await self.get(tag_key, default=[])
            
            if cache_keys:
                await asyncio.gather(*[self.delete(key) for key in cache_keys])
                await self.delete(tag_key)
        except Exception as e:
            logger.warning(f"Cache tag invalidation failed for tag {tag}: {e}")
    
    async def invalidate_tags(self, tags: List[str]) -> None:
        """Invalidate all cache entries with any of the given tags."""
        await asyncio.gather(*[self.invalidate_tag(tag) for tag in tags])
    
    async def clear(self) -> None:
        """Clear the entire cache."""
        # Note: This is a destructive operation and should be used with caution
        # In a real implementation, you might want to only clear a specific prefix
        if isinstance(self.backend, InMemoryBackend):
            self.backend._cache.clear()
    
    async def close(self) -> None:
        """Close the cache connection."""
        await self.backend.close()
    
    def _get_tag_key(self, tag: str) -> str:
        """Get the cache key for a tag."""
        return f"cache_tag:{tag}"
    
    async def _add_to_tag(self, tag_key: str, cache_key: str, expire: Optional[int]) -> None:
        """Add a cache key to a tag."""
        try:
            cache_keys = await self.get(tag_key, default=[])
            if cache_key not in cache_keys:
                cache_keys.append(cache_key)
                await self.backend.set(
                    tag_key,
                    self._serializer.dumps(cache_keys).encode(),
                    expire=expire
                )
        except Exception as e:
            logger.warning(f"Failed to add key {cache_key} to tag {tag_key}: {e}")

def cached(
    key: str = None,
    ttl: int = 300,
    tags: List[str] = None,
    key_builder: Callable[..., str] = None,
    cache_none: bool = True
):
    """Decorator to cache function results.
    
    Args:
        key: Cache key (can include {arg} placeholders)
        ttl: Time to live in seconds
        tags: List of cache tags for invalidation
        key_builder: Function to generate cache key from function arguments
        cache_none: Whether to cache None results
    """
    def decorator(func: Callable[..., R]) -> Callable[..., R]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> R:
            # Skip caching if disabled
            if not settings.CACHE_ENABLED:
                return await func(*args, **kwargs)
            
            # Get cache instance from first argument if it's a method
            cache = None
            if args and hasattr(args[0], 'cache'):
                cache = args[0].cache
            
            if cache is None:
                cache = CacheManager()
            
            # Build cache key
            cache_key = None
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            elif key:
                # Format key with function arguments
                bound_arguments = {}
                if hasattr(func, '__annotations__'):
                    # Handle both async and sync functions
                    if asyncio.iscoroutinefunction(func):
                        sig = inspect.signature(func)
                        bound = sig.bind(*args, **kwargs)
                        bound.apply_defaults()
                        bound_arguments = bound.arguments
                
                cache_key = key.format(**bound_arguments)
            else:
                # Default key based on function name and arguments
                cache_key = f"{func.__module__}:{func.__name__}:{args}:{kwargs}"
            
            # Try to get from cache
            result = await cache.get(cache_key)
            if result is not None or (result is None and not cache_none):
                return result
            
            # Call the wrapped function
            result = await func(*args, **kwargs)
            
            # Cache the result
            if result is not None or cache_none:
                await cache.set(cache_key, result, expire=ttl, tags=tags)
            
            return result
        
        return wrapper
    return decorator

# Global cache instance
cache = CacheManager()

# Cache invalidation strategies
class CacheInvalidationStrategy:
    """Base class for cache invalidation strategies."""
    
    async def on_create(self, key: str, value: Any, **kwargs) -> None:
        """Handle cache entry creation."""
        pass
    
    async def on_update(self, key: str, old_value: Any, new_value: Any, **kwargs) -> None:
        """Handle cache entry update."""
        pass
    
    async def on_delete(self, key: str, value: Any, **kwargs) -> None:
        """Handle cache entry deletion."""
        pass

class TimeBasedInvalidation(CacheInvalidationStrategy):
    """Time-based cache invalidation strategy."""
    
    def __init__(self, ttl: int):
        """Initialize with time to live in seconds."""
        self.ttl = ttl
    
    async def on_create(self, key: str, value: Any, **kwargs) -> None:
        """Set TTL on new cache entries."""
        cache = kwargs.get('cache')
        if cache:
            await cache.expire(key, self.ttl)

class TagBasedInvalidation(CacheInvalidationStrategy):
    """Tag-based cache invalidation strategy."""
    
    def __init__(self, tags: List[str]):
        """Initialize with a list of tags."""
        self.tags = tags
    
    async def on_create(self, key: str, value: Any, **kwargs) -> None:
        """Add tags to new cache entries."""
        cache = kwargs.get('cache')
        if cache and self.tags:
            await cache.set(key, value, tags=self.tags)
    
    async def invalidate(self, cache: CacheManager) -> None:
        """Invalidate all cache entries with the given tags."""
        await cache.invalidate_tags(self.tags)

class WriteThroughInvalidation(CacheInvalidationStrategy):
    """Write-through cache invalidation strategy."""
    
    def __init__(self, write_func: Callable):
        """Initialize with a write function."""
        self.write_func = write_func
    
    async def on_update(self, key: str, old_value: Any, new_value: Any, **kwargs) -> None:
        """Write changes to the underlying data store."""
        await self.write_func(key, new_value)

class WriteBehindInvalidation(CacheInvalidationStrategy):
    """Write-behind cache invalidation strategy."""
    
    def __init__(self, write_func: Callable, batch_size: int = 100, flush_interval: int = 60):
        """Initialize with a write function and batching parameters."""
        self.write_func = write_func
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self._buffer = []
        self._last_flush = datetime.now()
    
    async def on_update(self, key: str, old_value: Any, new_value: Any, **kwargs) -> None:
        """Buffer changes and write in batches."""
        self._buffer.append((key, new_value))
        
        # Flush if buffer size exceeds batch size or flush interval has passed
        now = datetime.now()
        if (len(self._buffer) >= self.batch_size or 
            (now - self._last_flush).total_seconds() >= self.flush_interval):
            await self._flush()
    
    async def _flush(self) -> None:
        """Flush buffered changes to the data store."""
        if not self._buffer:
            return
            
        try:
            # Process in batches
            for i in range(0, len(self._buffer), self.batch_size):
                batch = self._buffer[i:i + self.batch_size]
                await self.write_func(batch)
            
            self._buffer = []
            self._last_flush = datetime.now()
        except Exception as e:
            logger.error(f"Failed to flush write-behind buffer: {e}")
    
    async def close(self) -> None:
        """Flush any remaining changes and clean up."""
        await self._flush()

# Initialize cache with default settings
async def init_cache() -> CacheManager:
    """Initialize the cache with default settings."""
    return CacheManager()

# Clean up cache connections
async def close_cache() -> None:
    """Close cache connections."""
    await cache.close()
