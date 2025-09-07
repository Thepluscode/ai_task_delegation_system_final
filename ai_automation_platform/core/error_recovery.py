import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Callable, Dict, List, Optional, Type, TypeVar, Union

from circuitbreaker import CircuitBreaker, CircuitBreakerError
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
    RetryError,
    TryAgain,
)
from typing_extensions import ParamSpec

from .config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T")
P = ParamSpec("P")

class RetryableError(Exception):
    """Base exception for retryable errors."""
    pass

class NonRetryableError(Exception):
    """Exception for non-retryable errors."""
    pass

def create_circuit_breaker(
    failure_threshold: int = None,
    recovery_timeout: int = None,
    expected_exception: Type[Exception] = Exception,
    name: str = "default",
) -> CircuitBreaker:
    """
    Create a circuit breaker instance with the given parameters.
    
    Args:
        failure_threshold: Number of failures before opening the circuit
        recovery_timeout: Time in seconds to wait before attempting to close the circuit
        expected_exception: Exception type that should trigger the circuit breaker
        name: Name of the circuit breaker for logging
        
    Returns:
        Configured CircuitBreaker instance
    """
    return CircuitBreaker(
        failure_threshold=failure_threshold or settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
        recovery_timeout=recovery_timeout or settings.CIRCUIT_BREAKER_RECOVERY_TIMEOUT,
        expected_exception=expected_exception,
        name=name,
    )

def async_retry(
    max_retries: int = None,
    backoff_factor: float = None,
    retry_exceptions: tuple = (Exception,),
    **retry_kwargs,
):
    """
    Decorator for adding retry logic to async functions.
    
    Args:
        max_retries: Maximum number of retry attempts
        backoff_factor: Factor for exponential backoff
        retry_exceptions: Tuple of exceptions to retry on
        **retry_kwargs: Additional arguments to pass to tenacity.retry
        
    Returns:
        Decorated function with retry logic
    """
    max_retries = max_retries or settings.MAX_RETRIES
    backoff_factor = backoff_factor or settings.RETRY_BACKOFF_FACTOR
    
    def decorator(func):
        @retry(
            stop=stop_after_attempt(max_retries),
            wait=wait_exponential(multiplier=backoff_factor, min=1, max=60),
            retry=retry_if_exception_type(retry_exceptions),
            before_sleep=before_sleep_log(logger, logging.WARNING),
            **retry_kwargs,
        )
        async def wrapped(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except retry_exceptions as e:
                logger.warning(
                    f"Attempt failed: {e}. Retrying...",
                    exc_info=True,
                    extra={"function": func.__name__},
                )
                raise TryAgain from e
        
        return wrapped
    return decorator

class DeadLetterQueue:
    """
    Dead Letter Queue for handling unprocessable messages.
    """
    
    def __init__(self, max_size: int = 1000):
        """
        Initialize the Dead Letter Queue.
        
        Args:
            max_size: Maximum number of items to keep in the queue
        """
        self.queue: List[Dict[str, Any]] = []
        self.max_size = max_size
        self._lock = asyncio.Lock()
    
    async def add(
        self,
        message: Any,
        error: Exception,
        context: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Add a message to the dead letter queue.
        
        Args:
            message: The message that failed processing
            error: The exception that occurred
            context: Additional context about the failure
        """
        async with self._lock:
            if len(self.queue) >= self.max_size:
                self.queue.pop(0)  # Remove oldest message if queue is full
                
            entry = {
                "timestamp": datetime.utcnow().isoformat(),
                "message": str(message),
                "error": str(error),
                "error_type": error.__class__.__name__,
                "context": context or {},
            }
            self.queue.append(entry)
            
            logger.error(
                "Message moved to dead letter queue",
                extra={
                    "message": str(message)[:1000],  # Limit message size in logs
                    "error": str(error),
                    "error_type": error.__class__.__name__,
                },
            )
    
    async def get_messages(
        self,
        limit: int = 100,
        since: Optional[datetime] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve messages from the dead letter queue.
        
        Args:
            limit: Maximum number of messages to return
            since: Only return messages since this datetime
            
        Returns:
            List of dead letter messages
        """
        async with self._lock:
            messages = self.queue.copy()
            
        if since:
            messages = [
                msg for msg in messages
                if datetime.fromisoformat(msg["timestamp"]) >= since
            ]
            
        return messages[-limit:]
    
    async def clear(self) -> None:
        """Clear all messages from the dead letter queue."""
        async with self._lock:
            self.queue.clear()

# Global dead letter queue instance
dead_letter_queue = DeadLetterQueue()
