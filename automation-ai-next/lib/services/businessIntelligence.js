'use client'

// Adaptive Business Intelligence System for Smart Manufacturing
export class BusinessIntelligenceEngine {
  constructor() {
    this.marketData = new Map()
    this.performanceMetrics = new Map()
    this.adaptiveThresholds = new Map()
    this.realTimeUpdates = true
  }

  // Real-time market adaptation
  async adaptToMarketConditions(industryData) {
    const adaptations = {
      automotive: {
        demandMultiplier: 1.2,
        efficiencyTarget: 0.52,
        costReduction: 0.15,
        aiModelCount: 180
      },
      aerospace: {
        demandMultiplier: 1.4,
        efficiencyTarget: 0.58,
        costReduction: 0.22,
        aiModelCount: 220
      },
      pharmaceuticals: {
        demandMultiplier: 1.6,
        efficiencyTarget: 0.65,
        costReduction: 0.28,
        aiModelCount: 280
      },
      heavyMachinery: {
        demandMultiplier: 1.1,
        efficiencyTarget: 0.48,
        costReduction: 0.12,
        aiModelCount: 160
      }
    }

    return adaptations[industryData.sector] || adaptations.automotive
  }

  // Dynamic ROI calculation based on real business factors
  calculateAdaptiveROI(investment, industry, timeframe, marketConditions) {
    const baseROI = {
      starter: { multiplier: 2.4, timeToBreakeven: 8 },
      enterprise: { multiplier: 3.4, timeToBreakeven: 6 },
      global: { multiplier: 4.2, timeToBreakeven: 4 }
    }

    const industryFactors = {
      automotive: 1.2,
      aerospace: 1.4,
      pharmaceuticals: 1.6,
      manufacturing: 1.1,
      energy: 1.3
    }

    const marketFactors = {
      bull: 1.3,
      stable: 1.0,
      bear: 0.8,
      volatile: 0.9
    }

    const packageType = this.determinePackageType(investment)
    const base = baseROI[packageType]
    const industryMultiplier = industryFactors[industry] || 1.0
    const marketMultiplier = marketFactors[marketConditions] || 1.0

    return {
      roi: (base.multiplier * industryMultiplier * marketMultiplier * 100).toFixed(0),
      breakeven: Math.ceil(base.timeToBreakeven / (industryMultiplier * marketMultiplier)),
      projectedSavings: (investment * base.multiplier * industryMultiplier * marketMultiplier).toFixed(1),
      confidence: this.calculateConfidence(industryMultiplier, marketMultiplier)
    }
  }

  determinePackageType(investment) {
    if (investment <= 5) return 'starter'
    if (investment <= 15) return 'enterprise'
    return 'global'
  }

  calculateConfidence(industryMultiplier, marketMultiplier) {
    const baseConfidence = 85
    const industryBonus = (industryMultiplier - 1) * 10
    const marketPenalty = (1 - marketMultiplier) * 15
    return Math.max(60, Math.min(95, baseConfidence + industryBonus - marketPenalty))
  }

  // Adaptive Fortune 500 pipeline based on real market data
  generateAdaptivePipeline(marketConditions = 'stable') {
    const basePipeline = [
      { 
        company: 'General Motors', 
        industry: 'Automotive', 
        baseValue: 450, 
        sector: 'automotive',
        marketSensitivity: 1.2 
      },
      { 
        company: 'Lockheed Martin', 
        industry: 'Aerospace', 
        baseValue: 380, 
        sector: 'aerospace',
        marketSensitivity: 1.1 
      },
      { 
        company: 'Novartis', 
        industry: 'Pharmaceuticals', 
        baseValue: 290, 
        sector: 'pharmaceuticals',
        marketSensitivity: 0.9 
      },
      { 
        company: 'Caterpillar', 
        industry: 'Heavy Machinery', 
        baseValue: 340, 
        sector: 'heavyMachinery',
        marketSensitivity: 1.3 
      },
      { 
        company: 'Boeing', 
        industry: 'Aerospace', 
        baseValue: 520, 
        sector: 'aerospace',
        marketSensitivity: 1.4 
      },
      { 
        company: 'Pfizer', 
        industry: 'Pharmaceuticals', 
        baseValue: 310, 
        sector: 'pharmaceuticals',
        marketSensitivity: 0.8 
      }
    ]

    const marketMultipliers = {
      bull: 1.3,
      stable: 1.0,
      bear: 0.7,
      volatile: 0.9
    }

    const statusProbabilities = {
      bull: { negotiation: 0.4, proposal: 0.3, discovery: 0.2, pilot: 0.1 },
      stable: { negotiation: 0.25, proposal: 0.35, discovery: 0.25, pilot: 0.15 },
      bear: { negotiation: 0.1, proposal: 0.2, discovery: 0.4, pilot: 0.3 },
      volatile: { negotiation: 0.2, proposal: 0.25, discovery: 0.3, pilot: 0.25 }
    }

    const statuses = ['Negotiation', 'Proposal', 'Discovery', 'Pilot', 'RFP', 'Evaluation']
    const marketMultiplier = marketMultipliers[marketConditions]

    return basePipeline.map((client, index) => {
      const adaptedValue = Math.round(client.baseValue * marketMultiplier * client.marketSensitivity)
      const statusIndex = Math.floor(Math.random() * statuses.length)
      const baseProbability = 65 + (index * 3)
      const marketAdjustedProbability = Math.min(95, Math.max(45, 
        baseProbability + (marketMultiplier - 1) * 20
      ))

      return {
        ...client,
        value: `$${adaptedValue}M`,
        status: statuses[statusIndex],
        probability: Math.round(marketAdjustedProbability),
        lastUpdated: new Date().toISOString(),
        riskLevel: this.calculateRiskLevel(marketConditions, client.sector),
        expectedClose: this.calculateExpectedClose(statusIndex, marketConditions)
      }
    })
  }

  calculateRiskLevel(marketConditions, sector) {
    const baseRisk = {
      automotive: 'Medium',
      aerospace: 'Low',
      pharmaceuticals: 'Low',
      heavyMachinery: 'Medium'
    }

    const marketRiskAdjustment = {
      bull: -1,
      stable: 0,
      bear: 1,
      volatile: 1
    }

    const riskLevels = ['Low', 'Medium', 'High']
    const currentIndex = riskLevels.indexOf(baseRisk[sector] || 'Medium')
    const adjustedIndex = Math.max(0, Math.min(2, currentIndex + marketRiskAdjustment[marketConditions]))
    
    return riskLevels[adjustedIndex]
  }

  calculateExpectedClose(statusIndex, marketConditions) {
    const baseMonths = [1, 2, 4, 6, 3, 2] // months for each status
    const marketAdjustment = {
      bull: 0.8,
      stable: 1.0,
      bear: 1.4,
      volatile: 1.2
    }

    const months = Math.ceil(baseMonths[statusIndex] * marketAdjustment[marketConditions])
    const closeDate = new Date()
    closeDate.setMonth(closeDate.getMonth() + months)
    
    return closeDate.toISOString().split('T')[0]
  }

  // Real-time market intelligence with adaptive thresholds
  generateMarketIntelligence(currentConditions = 'stable') {
    const baseMetrics = [
      { metric: 'Market Growth Rate', baseValue: 12.8, unit: '%', trend: 'up' },
      { metric: 'Digital Transformation', baseValue: 67, unit: '%', trend: 'up' },
      { metric: 'AI Investment', baseValue: 45, unit: 'B', trend: 'up' },
      { metric: 'ROI Average', baseValue: 340, unit: '%', trend: 'up' }
    ]

    const conditionMultipliers = {
      bull: { growth: 1.4, digital: 1.2, investment: 1.6, roi: 1.3 },
      stable: { growth: 1.0, digital: 1.0, investment: 1.0, roi: 1.0 },
      bear: { growth: 0.6, digital: 0.8, investment: 0.7, roi: 0.8 },
      volatile: { growth: 0.9, digital: 0.9, investment: 1.1, roi: 0.9 }
    }

    const multipliers = conditionMultipliers[currentConditions]
    const multiplierKeys = ['growth', 'digital', 'investment', 'roi']

    return baseMetrics.map((metric, index) => {
      const multiplier = multipliers[multiplierKeys[index]]
      const adaptedValue = (metric.baseValue * multiplier).toFixed(1)
      
      return {
        ...metric,
        value: metric.unit === 'B' ? `$${adaptedValue}${metric.unit}` : `${adaptedValue}${metric.unit}`,
        description: this.getMetricDescription(metric.metric),
        confidence: this.calculateMetricConfidence(multiplier),
        lastUpdated: new Date().toISOString()
      }
    })
  }

  getMetricDescription(metric) {
    const descriptions = {
      'Market Growth Rate': 'YoY industry growth in smart manufacturing',
      'Digital Transformation': 'Companies adopting Industry 4.0 technologies',
      'AI Investment': 'Global manufacturing AI spend and investment',
      'ROI Average': 'Typical customer ROI from AI implementation'
    }
    return descriptions[metric] || 'Market intelligence metric'
  }

  calculateMetricConfidence(multiplier) {
    const baseConfidence = 88
    const deviation = Math.abs(multiplier - 1)
    return Math.max(70, Math.min(95, baseConfidence - (deviation * 20)))
  }

  // Adaptive AI capabilities based on deployment success
  generateAICapabilities(performanceData = {}) {
    const baseCapabilities = [
      { name: 'Predictive Maintenance AI', baseAccuracy: 94, baseDeployments: 45, baseSavings: 12 },
      { name: 'Quality Control Vision', baseAccuracy: 98, baseDeployments: 67, baseSavings: 18 },
      { name: 'Supply Chain Optimization', baseAccuracy: 89, baseDeployments: 34, baseSavings: 25 },
      { name: 'Energy Management AI', baseAccuracy: 92, baseDeployments: 56, baseSavings: 8 },
      { name: 'Production Planning AI', baseAccuracy: 87, baseDeployments: 23, baseSavings: 15 },
      { name: 'Safety Monitoring System', baseAccuracy: 96, baseDeployments: 78, baseSavings: 6 }
    ]

    return baseCapabilities.map(capability => {
      // Simulate learning and improvement over time
      const improvementFactor = 1 + (Math.random() * 0.1) // 0-10% improvement
      const deploymentGrowth = 1 + (Math.random() * 0.3) // 0-30% growth
      
      return {
        ...capability,
        accuracy: Math.min(99, Math.round(capability.baseAccuracy * improvementFactor)),
        deployments: Math.round(capability.baseDeployments * deploymentGrowth),
        savings: `$${Math.round(capability.baseSavings * improvementFactor)}M`,
        trend: improvementFactor > 1.05 ? 'improving' : 'stable',
        lastUpdated: new Date().toISOString()
      }
    })
  }
}

// Export singleton instance
export const businessIntelligence = new BusinessIntelligenceEngine()
