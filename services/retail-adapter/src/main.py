"""
Retail Learning Service Adapter - E-commerce Task Delegation
Customer service and inventory optimization with AI
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum
import requests
from datetime import datetime
import uuid

app = FastAPI(
    title="Retail Learning Service Adapter",
    description="E-commerce task delegation with AI optimization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CustomerTier(str, Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    VIP = "vip"

class TaskType(str, Enum):
    CUSTOMER_INQUIRY = "customer_inquiry"
    ORDER_PROCESSING = "order_processing"
    RETURNS_HANDLING = "returns_handling"
    INVENTORY_MANAGEMENT = "inventory_management"
    PRICE_OPTIMIZATION = "price_optimization"
    PRODUCT_RECOMMENDATION = "product_recommendation"

class InquiryComplexity(str, Enum):
    SIMPLE = "simple"
    MODERATE = "moderate"
    COMPLEX = "complex"
    ESCALATION = "escalation"

# Pydantic models
class RetailTaskRequest(BaseModel):
    customer_id: str = Field(..., description="Customer identifier")
    task_type: TaskType = Field(..., description="Type of retail task")
    customer_tier: CustomerTier = Field(..., description="Customer tier level")
    inquiry_complexity: InquiryComplexity = Field(..., description="Inquiry complexity")
    product_category: Optional[str] = Field(None, description="Product category")
    order_value: Optional[float] = Field(None, description="Order value in USD")
    urgency: str = Field(default="medium", description="Task urgency")
    context: Dict[str, str] = Field(default={}, description="Additional context")

class RetailTaskDelegator:
    def __init__(self, learning_service_url: str = "http://localhost:8004"):
        self.learning_service_url = learning_service_url
        
    async def delegate_retail_task(self, task_request: RetailTaskRequest) -> Dict:
        """Delegate retail task to optimal agent"""
        
        # Get available retail agents
        available_agents = self._get_available_retail_agents()
        
        # Calculate task complexity
        complexity_score = self._calculate_retail_complexity(task_request)
        
        # Get AI predictions for each agent
        predictions = {}
        for agent in available_agents:
            prediction = await self._get_agent_prediction(
                agent_id=agent["id"],
                task_type=task_request.task_type.value,
                complexity=complexity_score
            )
            predictions[agent["id"]] = prediction
            
        # Apply retail-specific rules
        optimal_agent = self._apply_retail_rules(task_request, predictions, complexity_score)
        
        return {
            "task_id": f"RET_{uuid.uuid4().hex[:8].upper()}",
            "customer_id": task_request.customer_id,
            "assigned_agent": optimal_agent,
            "agent_type": next(a["type"] for a in available_agents if a["id"] == optimal_agent),
            "task_type": task_request.task_type.value,
            "customer_tier": task_request.customer_tier.value,
            "complexity_score": round(complexity_score, 3),
            "estimated_duration": predictions[optimal_agent]["predicted_duration"],
            "predicted_satisfaction": predictions[optimal_agent]["predicted_success_rate"],
            "confidence": predictions[optimal_agent]["confidence"],
            "reasoning": self._get_delegation_reasoning(task_request, optimal_agent, complexity_score),
            "delegation_timestamp": datetime.utcnow().isoformat(),
            "version": "1.0"
        }
    
    def _calculate_retail_complexity(self, task_request: RetailTaskRequest) -> float:
        """Calculate retail task complexity score"""
        complexity = 0.0
        
        # Customer tier factor (VIP customers need more attention)
        tier_weights = {
            CustomerTier.BRONZE: 0.1,
            CustomerTier.SILVER: 0.2,
            CustomerTier.GOLD: 0.4,
            CustomerTier.PLATINUM: 0.6,
            CustomerTier.VIP: 0.8
        }
        complexity += tier_weights.get(task_request.customer_tier, 0.2)
        
        # Inquiry complexity
        inquiry_weights = {
            InquiryComplexity.SIMPLE: 0.1,
            InquiryComplexity.MODERATE: 0.3,
            InquiryComplexity.COMPLEX: 0.6,
            InquiryComplexity.ESCALATION: 0.9
        }
        complexity += inquiry_weights.get(task_request.inquiry_complexity, 0.3)
        
        # Task type complexity
        task_complexity = {
            TaskType.CUSTOMER_INQUIRY: 0.2,
            TaskType.ORDER_PROCESSING: 0.1,
            TaskType.RETURNS_HANDLING: 0.4,
            TaskType.INVENTORY_MANAGEMENT: 0.5,
            TaskType.PRICE_OPTIMIZATION: 0.7,
            TaskType.PRODUCT_RECOMMENDATION: 0.3
        }
        complexity += task_complexity.get(task_request.task_type, 0.3)
        
        # Order value factor
        if task_request.order_value:
            if task_request.order_value > 1000:
                complexity += 0.3
            elif task_request.order_value > 500:
                complexity += 0.2
            elif task_request.order_value > 100:
                complexity += 0.1
        
        return min(complexity, 1.0)
    
    def _apply_retail_rules(self, task_request: RetailTaskRequest, 
                          predictions: Dict, complexity_score: float) -> str:
        """Apply retail-specific delegation rules"""
        
        # VIP customers always get human agents
        if task_request.customer_tier in [CustomerTier.VIP, CustomerTier.PLATINUM]:
            human_agents = [
                agent_id for agent_id in predictions.keys()
                if "human" in agent_id.lower() or "specialist" in agent_id.lower()
            ]
            if human_agents:
                return max(human_agents, key=lambda x: predictions[x]["predicted_quality"])
        
        # Escalation cases need senior agents
        if task_request.inquiry_complexity == InquiryComplexity.ESCALATION:
            senior_agents = [
                agent_id for agent_id in predictions.keys()
                if "senior" in agent_id.lower() or "manager" in agent_id.lower()
            ]
            if senior_agents:
                return max(senior_agents, key=lambda x: predictions[x]["predicted_quality"])
        
        # High-value orders need human oversight
        if task_request.order_value and task_request.order_value > 1000:
            human_agents = [
                agent_id for agent_id in predictions.keys()
                if "human" in agent_id.lower() and "ai" not in agent_id.lower()
            ]
            if human_agents:
                return max(human_agents, key=lambda x: predictions[x]["predicted_quality"])
        
        # Simple inquiries can go to chatbots
        if (task_request.inquiry_complexity == InquiryComplexity.SIMPLE and
            task_request.customer_tier in [CustomerTier.BRONZE, CustomerTier.SILVER] and
            task_request.task_type in [TaskType.CUSTOMER_INQUIRY, TaskType.ORDER_PROCESSING]):
            ai_agents = [
                agent_id for agent_id in predictions.keys()
                if "chatbot" in agent_id.lower() or "ai" in agent_id.lower()
            ]
            if ai_agents:
                best_ai = max(ai_agents, key=lambda x: predictions[x]["predicted_quality"])
                if predictions[best_ai]["predicted_quality"] > 0.80:
                    return best_ai
        
        # Product recommendations can use AI
        if task_request.task_type == TaskType.PRODUCT_RECOMMENDATION:
            ai_agents = [
                agent_id for agent_id in predictions.keys()
                if "recommendation" in agent_id.lower() or "ai" in agent_id.lower()
            ]
            if ai_agents:
                return max(ai_agents, key=lambda x: predictions[x]["predicted_quality"])
        
        # Default: best predicted agent
        return max(predictions.keys(), key=lambda x: predictions[x]["predicted_quality"])
    
    def _get_delegation_reasoning(self, task_request: RetailTaskRequest, 
                                agent_id: str, complexity_score: float) -> str:
        """Generate reasoning for delegation decision"""
        
        if task_request.customer_tier == CustomerTier.VIP:
            return f"VIP customer - routed to premium human agent for personalized service"
        elif task_request.inquiry_complexity == InquiryComplexity.ESCALATION:
            return f"Escalation case - assigned to senior agent for resolution"
        elif "chatbot" in agent_id.lower():
            return f"Simple {task_request.task_type.value} - suitable for AI chatbot"
        elif "ai" in agent_id.lower():
            return f"AI-optimized {task_request.task_type.value} - automated processing"
        else:
            return f"Complex case (complexity: {complexity_score:.2f}) - requires human expertise"
    
    def _get_available_retail_agents(self) -> List[Dict]:
        """Get available retail agents"""
        return [
            {"id": "chatbot_customer_service", "type": "ai_chatbot", "specialization": "customer_service"},
            {"id": "ai_recommendation_engine", "type": "ai_system", "specialization": "recommendations"},
            {"id": "human_agent_sarah", "type": "human_agent", "specialization": "customer_service"},
            {"id": "senior_agent_mike", "type": "senior_agent", "specialization": "escalations"},
            {"id": "specialist_returns_jane", "type": "specialist", "specialization": "returns"},
            {"id": "inventory_manager_tom", "type": "human_specialist", "specialization": "inventory"},
            {"id": "pricing_ai_system", "type": "ai_system", "specialization": "pricing"}
        ]
    
    async def _get_agent_prediction(self, agent_id: str, task_type: str, complexity: float) -> Dict:
        """Get performance prediction from learning service"""
        try:
            response = requests.get(
                f"{self.learning_service_url}/api/v1/learning/predict-performance/{agent_id}",
                params={"task_type": task_type},
                timeout=5
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Warning: Could not reach learning service: {e}")
        
        # Retail-specific fallback predictions
        if "chatbot" in agent_id.lower():
            return {
                "predicted_success_rate": 0.95 if complexity < 0.3 else 0.70,
                "predicted_duration": 2 if complexity < 0.3 else 5,
                "predicted_quality": 0.90 if complexity < 0.3 else 0.70,
                "confidence": 0.90 if complexity < 0.3 else 0.60
            }
        elif "ai" in agent_id.lower():
            return {
                "predicted_success_rate": 0.88,
                "predicted_duration": int(3 + complexity * 10),
                "predicted_quality": 0.85,
                "confidence": 0.80
            }
        elif "senior" in agent_id.lower():
            return {
                "predicted_success_rate": 0.96,
                "predicted_duration": int(15 + complexity * 30),
                "predicted_quality": 0.94,
                "confidence": 0.90
            }
        else:  # Human agent
            return {
                "predicted_success_rate": 0.90,
                "predicted_duration": int(10 + complexity * 20),
                "predicted_quality": 0.88,
                "confidence": 0.85
            }

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "Retail Learning Service Adapter",
        "status": "running",
        "version": "1.0.0",
        "capabilities": [
            "customer_service_routing",
            "order_processing",
            "returns_management",
            "inventory_optimization",
            "price_optimization",
            "product_recommendations"
        ],
        "customer_tiers": [e.value for e in CustomerTier],
        "task_types": [e.value for e in TaskType]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "retail-adapter", "version": "1.0.0"}

@app.post("/api/v1/retail/delegate-task")
async def delegate_retail_task(request: RetailTaskRequest):
    """Delegate retail task to optimal agent"""
    
    try:
        delegator = RetailTaskDelegator()
        result = await delegator.delegate_retail_task(request)
        
        return {
            "success": True,
            "delegation": result,
            "message": f"Retail task delegated successfully",
            "version": "1.0"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8010)
