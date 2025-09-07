import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel') || 'all'

  try {
    // Simulate retail dashboard data
    const retailData = {
      totalRevenue: 45000000, // $45M
      activeCustomers: 125000,
      newCustomers: 1250,
      conversionRate: 0.034,
      customerSatisfaction: 0.87,
      
      // Customer service data
      customerServiceData: [
        { hour: '06:00', inquiries: 45, resolutionRate: 92 },
        { hour: '08:00', inquiries: 128, resolutionRate: 94 },
        { hour: '10:00', inquiries: 245, resolutionRate: 96 },
        { hour: '12:00', inquiries: 320, resolutionRate: 95 },
        { hour: '14:00', inquiries: 380, resolutionRate: 97 },
        { hour: '16:00', inquiries: 425, resolutionRate: 96 },
        { hour: '18:00', inquiries: 390, resolutionRate: 94 },
        { hour: '20:00', inquiries: 280, resolutionRate: 93 },
        { hour: '22:00', inquiries: 150, resolutionRate: 91 }
      ],
      
      // Sentiment analysis
      sentimentAnalysis: [
        { name: 'Positive', value: 65, color: '#10B981' },
        { name: 'Neutral', value: 25, color: '#6B7280' },
        { name: 'Negative', value: 10, color: '#EF4444' }
      ],
      
      // Service channels
      serviceChannels: [
        {
          name: 'AI Chatbot',
          status: 'active',
          interactionsToday: 2847,
          avgResponseTime: '2.3s',
          resolutionRate: 89,
          satisfaction: 4.2
        },
        {
          name: 'Live Chat',
          status: 'active',
          interactionsToday: 1256,
          avgResponseTime: '45s',
          resolutionRate: 96,
          satisfaction: 4.6
        },
        {
          name: 'Phone Support',
          status: 'active',
          interactionsToday: 567,
          avgResponseTime: '2.1m',
          resolutionRate: 94,
          satisfaction: 4.4
        },
        {
          name: 'Email Support',
          status: 'active',
          interactionsToday: 892,
          avgResponseTime: '4.2h',
          resolutionRate: 98,
          satisfaction: 4.5
        }
      ],
      
      // Personalization data
      personalizationData: [
        { date: '2024-01-01', clickThroughRate: 3.2, conversionRate: 2.8 },
        { date: '2024-01-02', clickThroughRate: 3.5, conversionRate: 3.1 },
        { date: '2024-01-03', clickThroughRate: 3.8, conversionRate: 3.4 },
        { date: '2024-01-04', clickThroughRate: 4.1, conversionRate: 3.6 },
        { date: '2024-01-05', clickThroughRate: 4.3, conversionRate: 3.8 },
        { date: '2024-01-06', clickThroughRate: 4.5, conversionRate: 4.0 },
        { date: '2024-01-07', clickThroughRate: 4.7, conversionRate: 4.2 }
      ],
      
      // Recommendation metrics
      recommendationMetrics: {
        clickRate: 0.067,
        conversionRate: 0.042,
        revenue: 2850000,
        aovLift: 0.23
      },
      
      // Customer segments
      customerSegments: [
        {
          name: 'VIP Customers',
          customerCount: 5200,
          avgLTV: 2850,
          conversionRate: 12.5,
          growth: 8.2
        },
        {
          name: 'Frequent Buyers',
          customerCount: 18500,
          avgLTV: 1250,
          conversionRate: 8.7,
          growth: 5.1
        },
        {
          name: 'Occasional Shoppers',
          customerCount: 45000,
          avgLTV: 450,
          conversionRate: 3.2,
          growth: 2.8
        },
        {
          name: 'New Customers',
          customerCount: 56300,
          avgLTV: 180,
          conversionRate: 1.8,
          growth: 15.6
        }
      ],
      
      // Inventory trends
      inventoryTrends: [
        { date: '2024-01-01', stockLevel: 85000, demandForecast: 82000, reorderPoint: 75000 },
        { date: '2024-01-02', stockLevel: 83500, demandForecast: 84000, reorderPoint: 75000 },
        { date: '2024-01-03', stockLevel: 82000, demandForecast: 86000, reorderPoint: 75000 },
        { date: '2024-01-04', stockLevel: 80500, demandForecast: 88000, reorderPoint: 75000 },
        { date: '2024-01-05', stockLevel: 79000, demandForecast: 90000, reorderPoint: 75000 },
        { date: '2024-01-06', stockLevel: 77500, demandForecast: 92000, reorderPoint: 75000 },
        { date: '2024-01-07', stockLevel: 76000, demandForecast: 94000, reorderPoint: 75000 }
      ],
      
      // Stockout risks
      stockoutRisks: [
        {
          product: 'Premium Headphones',
          currentStock: 45,
          daysUntilStockout: 3,
          risk: 'high'
        },
        {
          product: 'Wireless Charger',
          currentStock: 128,
          daysUntilStockout: 7,
          risk: 'medium'
        },
        {
          product: 'Smart Watch',
          currentStock: 89,
          daysUntilStockout: 5,
          risk: 'medium'
        },
        {
          product: 'Bluetooth Speaker',
          currentStock: 234,
          daysUntilStockout: 12,
          risk: 'low'
        }
      ],
      
      // Inventory metrics
      inventoryMetrics: {
        turnoverRate: 8.5,
        fillRate: 0.967,
        daysOfSupply: 42,
        carryingCost: 125000
      },
      
      // Sales funnel
      salesFunnel: [
        { stage: 'Visitors', count: 125000 },
        { stage: 'Product Views', count: 85000 },
        { stage: 'Add to Cart', count: 28000 },
        { stage: 'Checkout', count: 12000 },
        { stage: 'Purchase', count: 4250 }
      ],
      
      // CLV trends
      clvTrends: [
        { month: 'Jan', newCustomers: 180, returningCustomers: 450, vipCustomers: 2850 },
        { month: 'Feb', newCustomers: 195, returningCustomers: 485, vipCustomers: 2920 },
        { month: 'Mar', newCustomers: 210, returningCustomers: 520, vipCustomers: 2995 },
        { month: 'Apr', newCustomers: 225, returningCustomers: 555, vipCustomers: 3070 },
        { month: 'May', newCustomers: 240, returningCustomers: 590, vipCustomers: 3145 },
        { month: 'Jun', newCustomers: 255, returningCustomers: 625, vipCustomers: 3220 }
      ],
      
      // Channel performance
      channelPerformance: [
        { channel: 'Website', revenue: 18500000 },
        { channel: 'Mobile App', revenue: 15200000 },
        { channel: 'Social Media', revenue: 6800000 },
        { channel: 'Email', revenue: 3200000 },
        { channel: 'Physical Store', revenue: 1300000 }
      ],
      
      // Device analytics
      deviceAnalytics: {
        desktop: 0.35,
        mobile: 0.52,
        tablet: 0.13
      },
      
      // Top pages
      topPages: [
        { path: '/products/electronics', views: 45000, conversionRate: 0.045 },
        { path: '/products/clothing', views: 38000, conversionRate: 0.038 },
        { path: '/products/home', views: 32000, conversionRate: 0.042 },
        { path: '/sale', views: 28000, conversionRate: 0.067 },
        { path: '/new-arrivals', views: 25000, conversionRate: 0.035 }
      ],
      
      // Campaign metrics
      campaignMetrics: {
        activeCampaigns: 12,
        avgOpenRate: 0.24,
        totalROI: 485000
      },
      
      // Campaign trends
      campaignTrends: [
        { date: '2024-01-01', roi: 15.2, engagement: 8.5 },
        { date: '2024-01-02', roi: 16.1, engagement: 9.2 },
        { date: '2024-01-03', roi: 17.3, engagement: 9.8 },
        { date: '2024-01-04', roi: 18.5, engagement: 10.4 },
        { date: '2024-01-05', roi: 19.2, engagement: 11.1 },
        { date: '2024-01-06', roi: 20.1, engagement: 11.7 },
        { date: '2024-01-07', roi: 21.3, engagement: 12.3 }
      ],
      
      // AI automation
      aiAutomation: {
        emailsAutomated: 125000
      },
      
      // AI optimizations
      aiOptimizations: [
        {
          type: 'Email Subject Lines',
          description: 'AI-optimized subject lines for better open rates',
          improvement: 23
        },
        {
          type: 'Product Recommendations',
          description: 'Personalized product suggestions',
          improvement: 34
        },
        {
          type: 'Price Optimization',
          description: 'Dynamic pricing based on demand',
          improvement: 18
        },
        {
          type: 'Ad Targeting',
          description: 'AI-powered audience segmentation',
          improvement: 28
        }
      ],
      
      // Recent campaigns
      recentCampaigns: [
        {
          name: 'Summer Sale 2024',
          type: 'Email',
          audience: 'All Customers',
          status: 'active',
          conversionRate: 0.067,
          revenue: 125000
        },
        {
          name: 'New Product Launch',
          type: 'Social Media',
          audience: 'Tech Enthusiasts',
          status: 'completed',
          conversionRate: 0.045,
          revenue: 89000
        },
        {
          name: 'Loyalty Program',
          type: 'Push Notification',
          audience: 'VIP Customers',
          status: 'active',
          conversionRate: 0.089,
          revenue: 156000
        }
      ],

      // Voice Commerce data
      voiceCommerce: {
        totalOrders: 1247,
        conversionRate: 0.067,
        avgOrderValue: 89.50,
        repeatRate: 0.34,
        intentAccuracy: 0.942,
        languages: 12,
        personalization: 0.875
      },

      // Voice assistants
      voiceAssistants: [
        {
          name: 'Amazon Alexa',
          status: 'active',
          interactions: 2847,
          successRate: 0.94,
          responseTime: '1.1s',
          revenue: 125000
        },
        {
          name: 'Google Assistant',
          status: 'active',
          interactions: 2156,
          successRate: 0.92,
          responseTime: '1.3s',
          revenue: 98000
        },
        {
          name: 'Apple Siri',
          status: 'active',
          interactions: 1567,
          successRate: 0.89,
          responseTime: '1.5s',
          revenue: 67000
        },
        {
          name: 'Custom Voice AI',
          status: 'active',
          interactions: 1234,
          successRate: 0.96,
          responseTime: '0.9s',
          revenue: 89000
        }
      ],

      // Top voice commands
      topVoiceCommands: [
        { phrase: 'Order my usual', count: 342 },
        { phrase: 'Add to cart', count: 289 },
        { phrase: 'Check order status', count: 234 },
        { phrase: 'Find deals', count: 198 },
        { phrase: 'Track my package', count: 167 }
      ],

      // AR/VR Shopping data
      arvrShopping: {
        activeUsers: 8947,
        conversionLift: 0.34
      },

      // Virtual try-on data
      virtualTryOn: [
        {
          category: 'Fashion & Apparel',
          adoptionRate: 0.67,
          tryOns: 4567,
          conversionRate: 0.23,
          avgSession: '3.2 min',
          returnRate: 0.12
        },
        {
          category: 'Eyewear',
          adoptionRate: 0.89,
          tryOns: 2834,
          conversionRate: 0.45,
          avgSession: '2.1 min',
          returnRate: 0.08
        },
        {
          category: 'Furniture',
          adoptionRate: 0.34,
          tryOns: 1923,
          conversionRate: 0.18,
          avgSession: '4.7 min',
          returnRate: 0.15
        },
        {
          category: 'Cosmetics',
          adoptionRate: 0.78,
          tryOns: 1456,
          conversionRate: 0.38,
          avgSession: '2.8 min',
          returnRate: 0.09
        }
      ],

      // AR/VR technology metrics
      arvrTech: {
        mobileAR: 0.95,
        webAR: 0.78,
        vrHeadsets: 0.23,
        loadTime: 2.3,
        frameRate: 60,
        accuracy: 0.968,
        satisfaction: 0.92,
        easeOfUse: 4.4,
        recommendation: 0.89
      },

      // AR/VR ROI
      arvrROI: {
        additionalRevenue: 2850000,
        conversionIncrease: 0.34,
        returnReduction: 0.23,
        engagementIncrease: 45
      }
    }

    return NextResponse.json(retailData)
  } catch (error) {
    console.error('Error fetching retail dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch retail data' },
      { status: 500 }
    )
  }
}
