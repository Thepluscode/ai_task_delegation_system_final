"""
Advanced Billing & Subscription Management Platform
Flexible pricing models, usage tracking, and revenue optimization
"""

import asyncio
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import numpy as np
from decimal import Decimal, ROUND_HALF_UP
import stripe
import redis
from sqlalchemy import create_engine, MetaData, Table, Column, String, DateTime, Float, Integer, JSON, Boolean

logger = logging.getLogger(__name__)

class PricingModel(Enum):
    SUBSCRIPTION = "subscription"
    USAGE_BASED = "usage_based"
    HYBRID = "hybrid"
    TIERED = "tiered"
    VOLUME_DISCOUNT = "volume_discount"
    CUSTOM = "custom"

class BillingCycle(Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"
    USAGE = "usage"

class SubscriptionStatus(Enum):
    ACTIVE = "active"
    TRIAL = "trial"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    PENDING = "pending"

class UsageMetricType(Enum):
    API_CALLS = "api_calls"
    ROBOT_HOURS = "robot_hours"
    TASKS_PROCESSED = "tasks_processed"
    DATA_STORAGE = "data_storage"
    BANDWIDTH = "bandwidth"
    USERS = "users"
    WORKFLOWS = "workflows"
    INTEGRATIONS = "integrations"

@dataclass
class PricingTier:
    tier_id: str
    name: str
    description: str
    base_price: Decimal
    billing_cycle: BillingCycle
    included_usage: Dict[UsageMetricType, int]
    overage_rates: Dict[UsageMetricType, Decimal]
    features: List[str]
    max_users: int
    max_robots: int
    support_level: str

@dataclass
class Subscription:
    subscription_id: str
    tenant_id: str
    pricing_tier: str
    status: SubscriptionStatus
    start_date: datetime
    end_date: datetime
    trial_end_date: Optional[datetime]
    auto_renew: bool
    payment_method_id: str
    billing_address: Dict[str, str]
    current_period_start: datetime
    current_period_end: datetime
    usage_limits: Dict[UsageMetricType, int]
    custom_pricing: Optional[Dict[str, Any]] = None

@dataclass
class UsageRecord:
    record_id: str
    tenant_id: str
    subscription_id: str
    metric_type: UsageMetricType
    quantity: int
    unit_price: Decimal
    total_amount: Decimal
    timestamp: datetime
    metadata: Dict[str, Any]

@dataclass
class Invoice:
    invoice_id: str
    tenant_id: str
    subscription_id: str
    billing_period_start: datetime
    billing_period_end: datetime
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    currency: str
    status: str
    due_date: datetime
    paid_date: Optional[datetime]
    line_items: List[Dict[str, Any]]

class PricingEngine:
    """Advanced pricing engine with multiple pricing models"""
    
    def __init__(self):
        self.pricing_tiers = {}
        self.custom_pricing_rules = {}
        self.discount_rules = {}
        self._initialize_default_tiers()
    
    def _initialize_default_tiers(self):
        """Initialize default pricing tiers"""
        # Starter Tier
        starter = PricingTier(
            tier_id="starter",
            name="Starter",
            description="Perfect for small teams getting started with automation",
            base_price=Decimal("499.00"),
            billing_cycle=BillingCycle.MONTHLY,
            included_usage={
                UsageMetricType.API_CALLS: 10000,
                UsageMetricType.ROBOT_HOURS: 100,
                UsageMetricType.TASKS_PROCESSED: 1000,
                UsageMetricType.DATA_STORAGE: 10,  # GB
                UsageMetricType.USERS: 10,
                UsageMetricType.WORKFLOWS: 20
            },
            overage_rates={
                UsageMetricType.API_CALLS: Decimal("0.001"),
                UsageMetricType.ROBOT_HOURS: Decimal("5.00"),
                UsageMetricType.TASKS_PROCESSED: Decimal("0.10"),
                UsageMetricType.DATA_STORAGE: Decimal("1.00"),
                UsageMetricType.USERS: Decimal("25.00"),
                UsageMetricType.WORKFLOWS: Decimal("10.00")
            },
            features=[
                "Basic automation", "Task management", "Robot control",
                "Basic analytics", "Email support"
            ],
            max_users=10,
            max_robots=5,
            support_level="email"
        )
        
        # Professional Tier
        professional = PricingTier(
            tier_id="professional",
            name="Professional",
            description="Advanced features for growing automation needs",
            base_price=Decimal("1999.00"),
            billing_cycle=BillingCycle.MONTHLY,
            included_usage={
                UsageMetricType.API_CALLS: 100000,
                UsageMetricType.ROBOT_HOURS: 500,
                UsageMetricType.TASKS_PROCESSED: 10000,
                UsageMetricType.DATA_STORAGE: 100,  # GB
                UsageMetricType.USERS: 100,
                UsageMetricType.WORKFLOWS: 200
            },
            overage_rates={
                UsageMetricType.API_CALLS: Decimal("0.0008"),
                UsageMetricType.ROBOT_HOURS: Decimal("4.00"),
                UsageMetricType.TASKS_PROCESSED: Decimal("0.08"),
                UsageMetricType.DATA_STORAGE: Decimal("0.80"),
                UsageMetricType.USERS: Decimal("20.00"),
                UsageMetricType.WORKFLOWS: Decimal("8.00")
            },
            features=[
                "Advanced automation", "Workflow designer", "API access",
                "Advanced analytics", "Priority support", "Custom integrations"
            ],
            max_users=100,
            max_robots=25,
            support_level="priority"
        )
        
        # Enterprise Tier
        enterprise = PricingTier(
            tier_id="enterprise",
            name="Enterprise",
            description="Full-scale automation for large organizations",
            base_price=Decimal("9999.00"),
            billing_cycle=BillingCycle.MONTHLY,
            included_usage={
                UsageMetricType.API_CALLS: 1000000,
                UsageMetricType.ROBOT_HOURS: 2000,
                UsageMetricType.TASKS_PROCESSED: 100000,
                UsageMetricType.DATA_STORAGE: 1000,  # GB
                UsageMetricType.USERS: 1000,
                UsageMetricType.WORKFLOWS: 1000
            },
            overage_rates={
                UsageMetricType.API_CALLS: Decimal("0.0005"),
                UsageMetricType.ROBOT_HOURS: Decimal("3.00"),
                UsageMetricType.TASKS_PROCESSED: Decimal("0.05"),
                UsageMetricType.DATA_STORAGE: Decimal("0.50"),
                UsageMetricType.USERS: Decimal("15.00"),
                UsageMetricType.WORKFLOWS: Decimal("5.00")
            },
            features=[
                "Enterprise automation", "Custom branding", "SSO",
                "Advanced security", "Compliance tools", "Dedicated support",
                "White-label options", "Custom development"
            ],
            max_users=10000,
            max_robots=100,
            support_level="dedicated"
        )
        
        self.pricing_tiers = {
            "starter": starter,
            "professional": professional,
            "enterprise": enterprise
        }
    
    async def calculate_subscription_price(self, tier_id: str, billing_cycle: BillingCycle,
                                         custom_requirements: Optional[Dict[str, Any]] = None) -> Decimal:
        """Calculate subscription price with discounts and customizations"""
        if tier_id not in self.pricing_tiers:
            raise ValueError(f"Invalid pricing tier: {tier_id}")
        
        tier = self.pricing_tiers[tier_id]
        base_price = tier.base_price
        
        # Apply billing cycle discounts
        if billing_cycle == BillingCycle.ANNUALLY:
            base_price *= Decimal("10")  # 10 months price for annual
        elif billing_cycle == BillingCycle.QUARTERLY:
            base_price *= Decimal("2.85")  # 2.85 months price for quarterly
        
        # Apply volume discounts for enterprise
        if tier_id == "enterprise" and custom_requirements:
            volume_discount = await self._calculate_volume_discount(custom_requirements)
            base_price *= (Decimal("1.0") - volume_discount)
        
        # Apply custom pricing adjustments
        if custom_requirements:
            custom_adjustment = await self._calculate_custom_pricing(tier_id, custom_requirements)
            base_price += custom_adjustment
        
        return base_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    async def _calculate_volume_discount(self, requirements: Dict[str, Any]) -> Decimal:
        """Calculate volume discount based on scale"""
        total_users = requirements.get('users', 0)
        total_robots = requirements.get('robots', 0)
        
        # Volume discount tiers
        if total_users > 5000 or total_robots > 200:
            return Decimal("0.20")  # 20% discount
        elif total_users > 1000 or total_robots > 50:
            return Decimal("0.15")  # 15% discount
        elif total_users > 500 or total_robots > 25:
            return Decimal("0.10")  # 10% discount
        
        return Decimal("0.0")
    
    async def _calculate_custom_pricing(self, tier_id: str, requirements: Dict[str, Any]) -> Decimal:
        """Calculate custom pricing adjustments"""
        adjustment = Decimal("0.0")
        
        # Custom feature pricing
        custom_features = requirements.get('custom_features', [])
        feature_pricing = {
            'dedicated_cloud': Decimal("2000.00"),
            'custom_integration': Decimal("1500.00"),
            'advanced_ai': Decimal("1000.00"),
            'white_label': Decimal("500.00")
        }
        
        for feature in custom_features:
            if feature in feature_pricing:
                adjustment += feature_pricing[feature]
        
        # Geographic pricing adjustments
        region = requirements.get('region', 'us')
        region_multipliers = {
            'us': Decimal("1.0"),
            'eu': Decimal("1.1"),
            'apac': Decimal("0.9"),
            'latam': Decimal("0.8")
        }
        
        if region in region_multipliers:
            base_tier_price = self.pricing_tiers[tier_id].base_price
            adjustment += base_tier_price * (region_multipliers[region] - Decimal("1.0"))
        
        return adjustment

class UsageTracker:
    """Track and aggregate usage metrics for billing"""
    
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.usage_aggregators = {}
    
    async def record_usage(self, tenant_id: str, metric_type: UsageMetricType, 
                          quantity: int, metadata: Dict[str, Any] = None) -> bool:
        """Record usage event"""
        try:
            # Create usage record
            record = UsageRecord(
                record_id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                subscription_id=await self._get_subscription_id(tenant_id),
                metric_type=metric_type,
                quantity=quantity,
                unit_price=Decimal("0.0"),  # Will be calculated during billing
                total_amount=Decimal("0.0"),
                timestamp=datetime.now(timezone.utc),
                metadata=metadata or {}
            )
            
            # Store in Redis for real-time tracking
            usage_key = f"usage:{tenant_id}:{metric_type.value}:{datetime.now().strftime('%Y-%m-%d')}"
            self.redis_client.incr(usage_key, quantity)
            self.redis_client.expire(usage_key, 86400 * 32)  # 32 days TTL
            
            # Store detailed record
            record_key = f"usage_record:{record.record_id}"
            self.redis_client.setex(
                record_key,
                86400 * 32,  # 32 days TTL
                json.dumps(asdict(record), default=str)
            )
            
            logger.info(f"Recorded usage: {tenant_id} - {metric_type.value}: {quantity}")
            return True
            
        except Exception as e:
            logger.error(f"Error recording usage: {e}")
            return False
    
    async def get_current_usage(self, tenant_id: str, metric_type: UsageMetricType,
                              period_start: datetime, period_end: datetime) -> int:
        """Get current usage for billing period"""
        total_usage = 0
        
        # Aggregate daily usage for the period
        current_date = period_start.date()
        end_date = period_end.date()
        
        while current_date <= end_date:
            usage_key = f"usage:{tenant_id}:{metric_type.value}:{current_date.strftime('%Y-%m-%d')}"
            daily_usage = self.redis_client.get(usage_key)
            if daily_usage:
                total_usage += int(daily_usage)
            
            current_date += timedelta(days=1)
        
        return total_usage
    
    async def _get_subscription_id(self, tenant_id: str) -> str:
        """Get subscription ID for tenant"""
        # This would query the subscription database
        return f"sub_{tenant_id}"
    
    async def get_usage_analytics(self, tenant_id: str, days: int = 30) -> Dict[str, Any]:
        """Get usage analytics for tenant"""
        analytics = {
            'tenant_id': tenant_id,
            'period_days': days,
            'usage_by_metric': {},
            'usage_trends': {},
            'cost_projection': Decimal("0.0")
        }
        
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Aggregate usage by metric type
        for metric_type in UsageMetricType:
            total_usage = 0
            daily_usage = []
            
            current_date = start_date
            while current_date <= end_date:
                usage_key = f"usage:{tenant_id}:{metric_type.value}:{current_date.strftime('%Y-%m-%d')}"
                daily_value = self.redis_client.get(usage_key)
                daily_value = int(daily_value) if daily_value else 0
                daily_usage.append(daily_value)
                total_usage += daily_value
                current_date += timedelta(days=1)
            
            analytics['usage_by_metric'][metric_type.value] = {
                'total': total_usage,
                'average_daily': total_usage / days,
                'peak_daily': max(daily_usage),
                'trend': self._calculate_trend(daily_usage)
            }
        
        return analytics
    
    def _calculate_trend(self, daily_values: List[int]) -> str:
        """Calculate usage trend"""
        if len(daily_values) < 7:
            return "insufficient_data"
        
        # Compare first and last week averages
        first_week = np.mean(daily_values[:7])
        last_week = np.mean(daily_values[-7:])
        
        if last_week > first_week * 1.1:
            return "increasing"
        elif last_week < first_week * 0.9:
            return "decreasing"
        else:
            return "stable"

class InvoiceGenerator:
    """Generate and manage invoices"""
    
    def __init__(self, pricing_engine: PricingEngine, usage_tracker: UsageTracker):
        self.pricing_engine = pricing_engine
        self.usage_tracker = usage_tracker
        self.tax_rates = {
            'US': Decimal("0.08"),  # 8% average sales tax
            'EU': Decimal("0.20"),  # 20% VAT
            'CA': Decimal("0.13"),  # 13% HST
            'default': Decimal("0.0")
        }
    
    async def generate_invoice(self, subscription: Subscription) -> Invoice:
        """Generate invoice for subscription billing period"""
        invoice_id = f"inv_{subscription.subscription_id}_{int(datetime.now().timestamp())}"
        
        # Get pricing tier
        tier = self.pricing_engine.pricing_tiers.get(subscription.pricing_tier)
        if not tier:
            raise ValueError(f"Invalid pricing tier: {subscription.pricing_tier}")
        
        # Calculate base subscription amount
        line_items = []
        subtotal = Decimal("0.0")
        
        # Base subscription fee
        base_amount = tier.base_price
        line_items.append({
            'description': f"{tier.name} Subscription",
            'quantity': 1,
            'unit_price': base_amount,
            'amount': base_amount
        })
        subtotal += base_amount
        
        # Calculate usage overages
        for metric_type, included_amount in tier.included_usage.items():
            actual_usage = await self.usage_tracker.get_current_usage(
                subscription.tenant_id,
                metric_type,
                subscription.current_period_start,
                subscription.current_period_end
            )
            
            if actual_usage > included_amount:
                overage_quantity = actual_usage - included_amount
                overage_rate = tier.overage_rates.get(metric_type, Decimal("0.0"))
                overage_amount = overage_quantity * overage_rate
                
                line_items.append({
                    'description': f"{metric_type.value.replace('_', ' ').title()} Overage",
                    'quantity': overage_quantity,
                    'unit_price': overage_rate,
                    'amount': overage_amount
                })
                subtotal += overage_amount
        
        # Calculate tax
        tax_amount = await self._calculate_tax(subtotal, subscription.billing_address)
        
        # Calculate discounts
        discount_amount = await self._calculate_discounts(subscription, subtotal)
        
        # Calculate total
        total_amount = subtotal + tax_amount - discount_amount
        
        # Create invoice
        invoice = Invoice(
            invoice_id=invoice_id,
            tenant_id=subscription.tenant_id,
            subscription_id=subscription.subscription_id,
            billing_period_start=subscription.current_period_start,
            billing_period_end=subscription.current_period_end,
            subtotal=subtotal,
            tax_amount=tax_amount,
            discount_amount=discount_amount,
            total_amount=total_amount,
            currency="USD",
            status="pending",
            due_date=datetime.now(timezone.utc) + timedelta(days=30),
            paid_date=None,
            line_items=line_items
        )
        
        logger.info(f"Generated invoice {invoice_id} for {subscription.tenant_id}: ${total_amount}")
        return invoice
    
    async def _calculate_tax(self, subtotal: Decimal, billing_address: Dict[str, str]) -> Decimal:
        """Calculate tax based on billing address"""
        country = billing_address.get('country', 'US')
        tax_rate = self.tax_rates.get(country, self.tax_rates['default'])
        return subtotal * tax_rate
    
    async def _calculate_discounts(self, subscription: Subscription, subtotal: Decimal) -> Decimal:
        """Calculate applicable discounts"""
        discount_amount = Decimal("0.0")
        
        # Annual billing discount
        if subscription.end_date - subscription.start_date >= timedelta(days=365):
            discount_amount += subtotal * Decimal("0.15")  # 15% annual discount
        
        # First-time customer discount
        # Volume discounts
        # Promotional discounts
        
        return discount_amount

class PaymentProcessor:
    """Handle payment processing and subscription management"""
    
    def __init__(self, stripe_api_key: str):
        stripe.api_key = stripe_api_key
        self.payment_methods = {}
    
    async def process_payment(self, invoice: Invoice, payment_method_id: str) -> bool:
        """Process payment for invoice"""
        try:
            # Create payment intent with Stripe
            payment_intent = stripe.PaymentIntent.create(
                amount=int(invoice.total_amount * 100),  # Convert to cents
                currency=invoice.currency.lower(),
                payment_method=payment_method_id,
                confirmation_method='manual',
                confirm=True,
                metadata={
                    'invoice_id': invoice.invoice_id,
                    'tenant_id': invoice.tenant_id,
                    'subscription_id': invoice.subscription_id
                }
            )
            
            if payment_intent.status == 'succeeded':
                # Update invoice status
                invoice.status = 'paid'
                invoice.paid_date = datetime.now(timezone.utc)
                
                logger.info(f"Payment successful for invoice {invoice.invoice_id}")
                return True
            else:
                logger.warning(f"Payment failed for invoice {invoice.invoice_id}: {payment_intent.status}")
                return False
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error processing payment: {e}")
            return False
        except Exception as e:
            logger.error(f"Error processing payment: {e}")
            return False
    
    async def setup_subscription_billing(self, subscription: Subscription) -> bool:
        """Setup automatic billing for subscription"""
        try:
            # Create Stripe customer
            customer = stripe.Customer.create(
                metadata={
                    'tenant_id': subscription.tenant_id,
                    'subscription_id': subscription.subscription_id
                }
            )
            
            # Create Stripe subscription
            stripe_subscription = stripe.Subscription.create(
                customer=customer.id,
                items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f"Automation Platform - {subscription.pricing_tier}"
                        },
                        'unit_amount': int(self.pricing_engine.pricing_tiers[subscription.pricing_tier].base_price * 100),
                        'recurring': {
                            'interval': 'month'
                        }
                    }
                }],
                metadata={
                    'tenant_id': subscription.tenant_id,
                    'subscription_id': subscription.subscription_id
                }
            )
            
            logger.info(f"Setup Stripe subscription for {subscription.tenant_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error setting up subscription billing: {e}")
            return False

class BillingPlatform:
    """Main billing platform orchestrator"""
    
    def __init__(self, stripe_api_key: str, redis_client: redis.Redis):
        self.pricing_engine = PricingEngine()
        self.usage_tracker = UsageTracker(redis_client)
        self.invoice_generator = InvoiceGenerator(self.pricing_engine, self.usage_tracker)
        self.payment_processor = PaymentProcessor(stripe_api_key)
        self.subscriptions = {}
    
    async def create_subscription(self, tenant_id: str, tier_id: str, 
                                billing_cycle: BillingCycle, payment_method_id: str,
                                billing_address: Dict[str, str]) -> Subscription:
        """Create new subscription"""
        subscription_id = str(uuid.uuid4())
        
        # Calculate pricing
        price = await self.pricing_engine.calculate_subscription_price(tier_id, billing_cycle)
        
        # Create subscription
        subscription = Subscription(
            subscription_id=subscription_id,
            tenant_id=tenant_id,
            pricing_tier=tier_id,
            status=SubscriptionStatus.TRIAL,  # Start with trial
            start_date=datetime.now(timezone.utc),
            end_date=datetime.now(timezone.utc) + timedelta(days=365),  # 1 year
            trial_end_date=datetime.now(timezone.utc) + timedelta(days=30),  # 30-day trial
            auto_renew=True,
            payment_method_id=payment_method_id,
            billing_address=billing_address,
            current_period_start=datetime.now(timezone.utc),
            current_period_end=datetime.now(timezone.utc) + timedelta(days=30),
            usage_limits=self.pricing_engine.pricing_tiers[tier_id].included_usage
        )
        
        # Setup billing
        await self.payment_processor.setup_subscription_billing(subscription)
        
        self.subscriptions[subscription_id] = subscription
        
        logger.info(f"Created subscription {subscription_id} for tenant {tenant_id}")
        return subscription
    
    async def process_monthly_billing(self) -> Dict[str, Any]:
        """Process monthly billing for all active subscriptions"""
        billing_results = {
            'processed_subscriptions': 0,
            'successful_payments': 0,
            'failed_payments': 0,
            'total_revenue': Decimal("0.0"),
            'errors': []
        }
        
        for subscription in self.subscriptions.values():
            if subscription.status == SubscriptionStatus.ACTIVE:
                try:
                    # Generate invoice
                    invoice = await self.invoice_generator.generate_invoice(subscription)
                    
                    # Process payment
                    payment_success = await self.payment_processor.process_payment(
                        invoice, subscription.payment_method_id
                    )
                    
                    billing_results['processed_subscriptions'] += 1
                    
                    if payment_success:
                        billing_results['successful_payments'] += 1
                        billing_results['total_revenue'] += invoice.total_amount
                    else:
                        billing_results['failed_payments'] += 1
                        
                except Exception as e:
                    billing_results['errors'].append({
                        'subscription_id': subscription.subscription_id,
                        'error': str(e)
                    })
        
        logger.info(f"Monthly billing processed: {billing_results}")
        return billing_results

# Global billing platform instance
billing_platform = None
