"""
AI Market Signals & Analysis Service - Buy/Sell Recommendations
Integrated into Enterprise Automation Platform
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum
from datetime import datetime, timedelta
import json
import random
import math
import uuid

app = FastAPI(
    title="AI Market Signals & Analysis Service",
    description="AI-powered buy/sell signals for Forex, Stocks & Crypto - Enterprise Integration",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MarketType(str, Enum):
    FOREX = "forex"
    STOCKS = "stocks"
    CRYPTO = "crypto"
    COMMODITIES = "commodities"

class SignalType(str, Enum):
    STRONG_BUY = "strong_buy"
    BUY = "buy"
    HOLD = "hold"
    SELL = "sell"
    STRONG_SELL = "strong_sell"

class TimeFrame(str, Enum):
    MINUTE_1 = "1m"
    MINUTE_5 = "5m"
    MINUTE_15 = "15m"
    HOUR_1 = "1h"
    HOUR_4 = "4h"
    DAY_1 = "1d"
    WEEK_1 = "1w"

class AnalysisType(str, Enum):
    TECHNICAL = "technical"
    FUNDAMENTAL = "fundamental"
    SENTIMENT = "sentiment"
    AI_PREDICTION = "ai_prediction"

# Pydantic models
class MarketAnalysisRequest(BaseModel):
    symbol: str = Field(..., description="Trading symbol (e.g., BTC/USD, AAPL)")
    market_type: MarketType = Field(..., description="Type of market")
    timeframe: TimeFrame = Field(default=TimeFrame.HOUR_1, description="Analysis timeframe")
    analysis_types: List[AnalysisType] = Field(
        default=[AnalysisType.TECHNICAL, AnalysisType.AI_PREDICTION],
        description="Types of analysis to perform"
    )
    risk_tolerance: str = Field(default="medium", description="Risk tolerance level")

class MarketSignal(BaseModel):
    symbol: str
    market_type: str
    signal: SignalType
    confidence: float
    entry_price: float
    target_price: float
    stop_loss: float
    timeframe: str
    reasoning: str
    risk_reward_ratio: float
    generated_at: str

class TechnicalIndicators(BaseModel):
    rsi: float = Field(..., description="Relative Strength Index")
    macd: float = Field(..., description="Moving Average Convergence Divergence")
    bollinger_position: float = Field(..., description="Position relative to Bollinger Bands")
    moving_average_trend: str = Field(..., description="MA trend direction")
    volume_trend: str = Field(..., description="Volume trend")
    support_level: float = Field(..., description="Support price level")
    resistance_level: float = Field(..., description="Resistance price level")

class MarketAnalysisEngine:
    def __init__(self):
        self.learning_service_url = "http://localhost:8005"
        
    def generate_market_signals(self, request: MarketAnalysisRequest) -> Dict:
        """Generate comprehensive buy/sell signals"""
        
        # Get current market data (simulated)
        market_data = self._get_market_data(request.symbol, request.market_type)
        
        # Perform different types of analysis
        technical_analysis = self._perform_technical_analysis(market_data, request.timeframe)
        ai_prediction = self._perform_ai_prediction(market_data, request.symbol)
        sentiment_analysis = self._perform_sentiment_analysis(request.symbol, request.market_type)
        
        # Generate composite signal
        signal_data = self._generate_composite_signal(
            technical_analysis, ai_prediction, sentiment_analysis, request
        )
        
        return {
            "signal": signal_data,
            "technical_indicators": technical_analysis,
            "ai_prediction": ai_prediction,
            "market_sentiment": sentiment_analysis,
            "market_data": market_data,
            "analysis_timestamp": datetime.utcnow().isoformat(),
            "version": "3.0"
        }
    
    def _get_market_data(self, symbol: str, market_type: MarketType) -> Dict:
        """Simulate real-time market data"""
        # In production, this would connect to real market data APIs
        base_prices = {
            "EUR/USD": 1.0850,
            "GBP/USD": 1.2650,
            "USD/JPY": 149.50,
            "BTC/USD": 67500.00,
            "ETH/USD": 3850.00,
            "SOL/USD": 175.00,
            "AAPL": 185.50,
            "GOOGL": 2785.00,
            "TSLA": 245.75,
            "MSFT": 420.25,
            "NVDA": 875.30
        }
        
        base_price = base_prices.get(symbol, 100.0)
        
        # Add some realistic price movement simulation
        volatility = {
            MarketType.CRYPTO: 0.05,    # 5% daily volatility
            MarketType.FOREX: 0.01,     # 1% daily volatility
            MarketType.STOCKS: 0.02,    # 2% daily volatility
            MarketType.COMMODITIES: 0.03 # 3% daily volatility
        }.get(market_type, 0.02)
        
        price_change = random.uniform(-volatility, volatility)
        current_price = base_price * (1 + price_change)
        
        return {
            "symbol": symbol,
            "current_price": round(current_price, 4),
            "price_change_24h": round(price_change * 100, 2),
            "volume_24h": random.randint(1000000, 50000000),
            "high_24h": round(current_price * 1.02, 4),
            "low_24h": round(current_price * 0.98, 4),
            "market_cap": random.randint(1000000000, 100000000000) if market_type == MarketType.CRYPTO else None
        }
    
    def _perform_technical_analysis(self, market_data: Dict, timeframe: TimeFrame) -> TechnicalIndicators:
        """Perform technical analysis and generate indicators"""
        current_price = market_data["current_price"]
        
        # Simulate technical indicators (in production, calculate from real OHLCV data)
        rsi = random.uniform(20, 80)  # RSI between 20-80
        macd = random.uniform(-0.5, 0.5)  # MACD signal
        bollinger_position = random.uniform(0, 1)  # Position in Bollinger Bands
        
        # Determine trends based on indicators
        if rsi > 70:
            ma_trend = "bearish"  # Overbought
        elif rsi < 30:
            ma_trend = "bullish"  # Oversold
        else:
            ma_trend = "sideways"
        
        volume_trend = random.choice(["increasing", "decreasing", "stable"])
        
        # Calculate support and resistance levels
        support_level = current_price * 0.95
        resistance_level = current_price * 1.05
        
        return TechnicalIndicators(
            rsi=round(rsi, 2),
            macd=round(macd, 4),
            bollinger_position=round(bollinger_position, 2),
            moving_average_trend=ma_trend,
            volume_trend=volume_trend,
            support_level=round(support_level, 4),
            resistance_level=round(resistance_level, 4)
        )
    
    def _perform_ai_prediction(self, market_data: Dict, symbol: str) -> Dict:
        """AI-powered price prediction"""
        current_price = market_data["current_price"]
        
        # Simulate AI model predictions (in production, use trained ML models)
        # Different prediction horizons
        predictions = {}
        
        for hours in [1, 4, 24, 168]:  # 1h, 4h, 1d, 1w
            # Simulate model confidence decreasing with time
            base_confidence = 0.85 - (hours / 168) * 0.2  # Decrease confidence over time
            
            # Simulate price prediction with some intelligent logic
            if symbol.startswith("BTC"):
                # Crypto tends to be more volatile
                price_change = random.uniform(-0.08, 0.12)  # Slight bullish bias
            elif "/" in symbol:
                # Forex tends to be more stable
                price_change = random.uniform(-0.02, 0.02)
            else:
                # Stocks moderate volatility
                price_change = random.uniform(-0.05, 0.06)
            
            predicted_price = current_price * (1 + price_change)
            
            predictions[f"{hours}h"] = {
                "predicted_price": round(predicted_price, 4),
                "confidence": round(base_confidence, 2),
                "price_change_percent": round(price_change * 100, 2),
                "model_used": "neural_network_v3"
            }
        
        return {
            "predictions": predictions,
            "overall_trend": "bullish" if predictions["24h"]["price_change_percent"] > 0 else "bearish",
            "prediction_accuracy_7d": random.uniform(0.75, 0.92),  # Model's recent accuracy
            "volatility_forecast": random.uniform(0.01, 0.05)
        }

    def _perform_sentiment_analysis(self, symbol: str, market_type: MarketType) -> Dict:
        """Analyze market sentiment from various sources"""
        # Simulate sentiment analysis from social media, news, etc.

        # Different assets have different sentiment patterns
        if market_type == MarketType.CRYPTO:
            # Crypto sentiment is more volatile
            social_sentiment = random.uniform(-0.6, 0.8)
            news_sentiment = random.uniform(-0.4, 0.6)
        elif market_type == MarketType.FOREX:
            # Forex sentiment more stable, influenced by economics
            social_sentiment = random.uniform(-0.3, 0.3)
            news_sentiment = random.uniform(-0.5, 0.5)
        else:
            # Stocks moderate sentiment
            social_sentiment = random.uniform(-0.4, 0.5)
            news_sentiment = random.uniform(-0.3, 0.4)

        # Combine sentiments
        overall_sentiment = (social_sentiment * 0.6 + news_sentiment * 0.4)

        # Determine sentiment category
        if overall_sentiment > 0.3:
            sentiment_label = "very_positive"
        elif overall_sentiment > 0.1:
            sentiment_label = "positive"
        elif overall_sentiment > -0.1:
            sentiment_label = "neutral"
        elif overall_sentiment > -0.3:
            sentiment_label = "negative"
        else:
            sentiment_label = "very_negative"

        return {
            "overall_sentiment": round(overall_sentiment, 2),
            "sentiment_label": sentiment_label,
            "social_media_sentiment": round(social_sentiment, 2),
            "news_sentiment": round(news_sentiment, 2),
            "fear_greed_index": random.randint(10, 90),
            "institutional_sentiment": random.uniform(-0.3, 0.4)
        }

    def _generate_composite_signal(self, technical: TechnicalIndicators, ai_pred: Dict,
                                 sentiment: Dict, request: MarketAnalysisRequest) -> MarketSignal:
        """Generate final buy/sell signal combining all analyses"""

        # Scoring system for signal generation
        signal_score = 0.0

        # Technical analysis scoring
        if technical.rsi < 30:
            signal_score += 1.0  # Oversold = buy signal
        elif technical.rsi > 70:
            signal_score -= 1.0  # Overbought = sell signal

        if technical.macd > 0:
            signal_score += 0.5  # Positive MACD = bullish
        else:
            signal_score -= 0.5

        if technical.moving_average_trend == "bullish":
            signal_score += 0.7
        elif technical.moving_average_trend == "bearish":
            signal_score -= 0.7

        # AI prediction scoring
        ai_24h_change = ai_pred["predictions"]["24h"]["price_change_percent"]
        ai_confidence = ai_pred["predictions"]["24h"]["confidence"]

        signal_score += (ai_24h_change / 100) * ai_confidence * 2

        # Sentiment scoring
        sentiment_score = sentiment["overall_sentiment"]
        signal_score += sentiment_score * 0.8

        # Determine final signal
        if signal_score > 1.2:
            signal_type = SignalType.STRONG_BUY
            confidence = min(0.95, abs(signal_score) / 2)
        elif signal_score > 0.4:
            signal_type = SignalType.BUY
            confidence = min(0.85, abs(signal_score) / 1.5)
        elif signal_score > -0.4:
            signal_type = SignalType.HOLD
            confidence = 0.6
        elif signal_score > -1.2:
            signal_type = SignalType.SELL
            confidence = min(0.85, abs(signal_score) / 1.5)
        else:
            signal_type = SignalType.STRONG_SELL
            confidence = min(0.95, abs(signal_score) / 2)

        # Get current price from market data
        current_price = 100.0  # Default fallback

        # Calculate entry, target, and stop loss prices
        if signal_type in [SignalType.BUY, SignalType.STRONG_BUY]:
            entry_price = technical.support_level
            target_price = technical.resistance_level
            stop_loss = entry_price * 0.97  # 3% stop loss
        else:
            entry_price = technical.resistance_level
            target_price = technical.support_level
            stop_loss = entry_price * 1.03  # 3% stop loss

        risk_reward = abs(target_price - entry_price) / abs(entry_price - stop_loss)

        # Generate reasoning
        reasoning_parts = []
        if technical.rsi < 30:
            reasoning_parts.append("RSI oversold (bullish)")
        elif technical.rsi > 70:
            reasoning_parts.append("RSI overbought (bearish)")

        if ai_24h_change > 2:
            reasoning_parts.append(f"AI predicts +{ai_24h_change:.1f}% (bullish)")
        elif ai_24h_change < -2:
            reasoning_parts.append(f"AI predicts {ai_24h_change:.1f}% (bearish)")

        if sentiment["sentiment_label"] in ["positive", "very_positive"]:
            reasoning_parts.append("Positive market sentiment")
        elif sentiment["sentiment_label"] in ["negative", "very_negative"]:
            reasoning_parts.append("Negative market sentiment")

        reasoning = "; ".join(reasoning_parts) if reasoning_parts else "Mixed signals, hold position"

        return MarketSignal(
            symbol=request.symbol,
            market_type=request.market_type.value,
            signal=signal_type,
            confidence=round(confidence, 2),
            entry_price=round(entry_price, 4),
            target_price=round(target_price, 4),
            stop_loss=round(stop_loss, 4),
            timeframe=request.timeframe.value,
            reasoning=reasoning,
            risk_reward_ratio=round(risk_reward, 2),
            generated_at=datetime.utcnow().isoformat()
        )

# API Endpoints
@app.get("/")
async def root():
    return {
        "service": "AI Market Signals & Analysis Service",
        "status": "running",
        "version": "3.0.0",
        "capabilities": [
            "buy_sell_signal_generation",
            "technical_analysis",
            "ai_price_prediction",
            "sentiment_analysis",
            "multi_timeframe_analysis",
            "risk_management"
        ],
        "supported_markets": [e.value for e in MarketType],
        "analysis_types": [e.value for e in AnalysisType],
        "timeframes": [e.value for e in TimeFrame]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "market-signals-service",
        "version": "3.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "models_active": 3,
        "markets_monitored": 4
    }

@app.post("/api/v1/signals/analyze")
async def analyze_market_signals(request: MarketAnalysisRequest):
    """Generate comprehensive market analysis and buy/sell signals"""
    try:
        engine = MarketAnalysisEngine()
        analysis = engine.generate_market_signals(request)

        return {
            "success": True,
            "analysis": analysis,
            "message": f"Market analysis completed for {request.symbol}",
            "version": "3.0"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/signals/trending")
async def get_trending_signals():
    """Get trending buy/sell signals across markets"""

    trending_assets = [
        {"symbol": "BTC/USD", "market": "crypto", "signal": "buy", "confidence": 0.87, "price_change": "+3.2%"},
        {"symbol": "EUR/USD", "market": "forex", "signal": "sell", "confidence": 0.72, "price_change": "-0.8%"},
        {"symbol": "AAPL", "market": "stocks", "signal": "strong_buy", "confidence": 0.91, "price_change": "+2.1%"},
        {"symbol": "ETH/USD", "market": "crypto", "signal": "hold", "confidence": 0.65, "price_change": "+0.5%"},
        {"symbol": "TSLA", "market": "stocks", "signal": "buy", "confidence": 0.78, "price_change": "+1.8%"},
        {"symbol": "NVDA", "market": "stocks", "signal": "strong_buy", "confidence": 0.93, "price_change": "+4.2%"}
    ]

    return {
        "trending_signals": trending_assets,
        "market_overview": {
            "bullish_signals": 4,
            "bearish_signals": 1,
            "neutral_signals": 1,
            "average_confidence": 0.81,
            "total_assets_analyzed": len(trending_assets)
        },
        "generated_at": datetime.utcnow().isoformat(),
        "version": "3.0"
    }

@app.get("/api/v1/signals/portfolio-scanner")
async def scan_portfolio_signals():
    """Scan multiple assets for immediate trading opportunities"""

    opportunities = [
        {
            "symbol": "NVDA",
            "signal": "strong_buy",
            "confidence": 0.93,
            "entry_price": 875.30,
            "target_price": 920.00,
            "stop_loss": 850.00,
            "risk_reward_ratio": 1.8,
            "urgency": "high",
            "reasoning": "AI chip demand surge; RSI oversold; positive earnings outlook",
            "timeframe": "1d"
        },
        {
            "symbol": "SOL/USD",
            "signal": "buy",
            "confidence": 0.84,
            "entry_price": 175.00,
            "target_price": 195.00,
            "stop_loss": 165.00,
            "risk_reward_ratio": 2.0,
            "urgency": "medium",
            "reasoning": "Strong DeFi ecosystem growth; technical breakout pattern",
            "timeframe": "4h"
        },
        {
            "symbol": "EUR/USD",
            "signal": "sell",
            "confidence": 0.76,
            "entry_price": 1.0850,
            "target_price": 1.0750,
            "stop_loss": 1.0900,
            "risk_reward_ratio": 2.0,
            "urgency": "medium",
            "reasoning": "ECB dovish stance; USD strength; technical resistance",
            "timeframe": "1h"
        }
    ]

    return {
        "immediate_opportunities": opportunities,
        "scan_summary": {
            "assets_scanned": 50,
            "opportunities_found": len(opportunities),
            "avg_confidence": 0.84,
            "high_urgency": 1,
            "medium_urgency": 2,
            "low_urgency": 0
        },
        "scan_timestamp": datetime.utcnow().isoformat(),
        "version": "3.0"
    }

@app.get("/api/v1/signals/market-overview")
async def get_market_overview():
    """Get comprehensive market overview with sentiment and trends"""

    return {
        "market_sentiment": {
            "overall": "bullish",
            "fear_greed_index": 72,
            "crypto_sentiment": "very_bullish",
            "forex_sentiment": "neutral",
            "stocks_sentiment": "bullish",
            "commodities_sentiment": "bearish"
        },
        "market_trends": {
            "crypto": {
                "trend": "upward",
                "strength": 0.85,
                "key_drivers": ["institutional_adoption", "etf_inflows", "defi_growth"]
            },
            "stocks": {
                "trend": "upward",
                "strength": 0.72,
                "key_drivers": ["ai_revolution", "earnings_growth", "fed_pause"]
            },
            "forex": {
                "trend": "mixed",
                "strength": 0.45,
                "key_drivers": ["central_bank_divergence", "geopolitical_tensions"]
            }
        },
        "top_movers": {
            "gainers": [
                {"symbol": "NVDA", "change": "+4.2%", "signal": "strong_buy"},
                {"symbol": "BTC/USD", "change": "+3.2%", "signal": "buy"},
                {"symbol": "AAPL", "change": "+2.1%", "signal": "strong_buy"}
            ],
            "losers": [
                {"symbol": "EUR/USD", "change": "-0.8%", "signal": "sell"},
                {"symbol": "GBP/USD", "change": "-0.6%", "signal": "hold"}
            ]
        },
        "analysis_timestamp": datetime.utcnow().isoformat(),
        "version": "3.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
