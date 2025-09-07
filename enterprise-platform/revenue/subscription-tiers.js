/**
 * Enterprise Subscription Tiers - Billion Dollar Revenue Model
 * Multi-tier SaaS pricing with enterprise features
 */

export const subscriptionTiers = {
  // Starter Tier - SMB Market
  starter: {
    name: "Starter",
    price: {
      monthly: 99,
      annual: 990, // 2 months free
      currency: "USD"
    },
    limits: {
      agents: 10,
      tasks_per_month: 1000,
      api_calls_per_month: 10000,
      storage_gb: 10,
      users: 5,
      integrations: 5
    },
    features: {
      core: [
        "Basic AI task delegation",
        "Standard agent management",
        "Email support",
        "Basic analytics",
        "Mobile app access"
      ],
      automation: [
        "Rule-based automation",
        "Basic workflow templates",
        "Standard reporting"
      ],
      security: [
        "SSL encryption",
        "Basic user management",
        "Standard backup"
      ]
    },
    target_market: "Small businesses, startups",
    estimated_users: 50000,
    conversion_rate: 0.15
  },

  // Professional Tier - Mid-Market
  professional: {
    name: "Professional",
    price: {
      monthly: 999,
      annual: 9990, // 2 months free
      currency: "USD"
    },
    limits: {
      agents: 100,
      tasks_per_month: 50000,
      api_calls_per_month: 500000,
      storage_gb: 100,
      users: 25,
      integrations: 25
    },
    features: {
      core: [
        "Advanced AI task delegation",
        "Multi-industry optimization",
        "Priority support (24/7)",
        "Advanced analytics & BI",
        "Custom mobile app",
        "API access"
      ],
      automation: [
        "ML-powered automation",
        "Custom workflow builder",
        "Predictive analytics",
        "Performance optimization",
        "A/B testing"
      ],
      security: [
        "Advanced encryption",
        "SSO integration",
        "Role-based access",
        "Audit logs",
        "Daily backups"
      ],
      integrations: [
        "CRM integration",
        "ERP connectivity",
        "Slack/Teams integration",
        "Webhook support"
      ]
    },
    target_market: "Mid-size companies, growing enterprises",
    estimated_users: 15000,
    conversion_rate: 0.25
  },

  // Enterprise Tier - Large Enterprises
  enterprise: {
    name: "Enterprise",
    price: {
      monthly: 9999,
      annual: 99990, // 2 months free
      currency: "USD"
    },
    limits: {
      agents: "unlimited",
      tasks_per_month: "unlimited",
      api_calls_per_month: "unlimited",
      storage_gb: 1000,
      users: 100,
      integrations: "unlimited"
    },
    features: {
      core: [
        "Enterprise AI orchestration",
        "Global multi-tenant deployment",
        "Dedicated success manager",
        "Executive dashboards",
        "White-label solutions",
        "Custom development"
      ],
      automation: [
        "Deep learning automation",
        "Reinforcement learning",
        "Custom AI models",
        "Real-time optimization",
        "Predictive maintenance",
        "Advanced simulation"
      ],
      security: [
        "Enterprise-grade security",
        "SOC2 Type II compliance",
        "GDPR compliance",
        "Custom security policies",
        "Dedicated infrastructure",
        "Real-time monitoring"
      ],
      integrations: [
        "Enterprise system integration",
        "Custom API development",
        "Legacy system connectors",
        "Real-time data sync",
        "Multi-cloud deployment"
      ],
      support: [
        "24/7 dedicated support",
        "Technical account manager",
        "Custom training programs",
        "On-site implementation",
        "Priority feature requests"
      ]
    },
    target_market: "Fortune 500, large enterprises",
    estimated_users: 3000,
    conversion_rate: 0.35
  },

  // Custom/Enterprise Plus - Ultra-Large Enterprises
  custom: {
    name: "Enterprise Plus",
    price: {
      monthly: "custom",
      annual: "custom",
      starting_at: 50000,
      currency: "USD"
    },
    limits: {
      agents: "unlimited",
      tasks_per_month: "unlimited",
      api_calls_per_month: "unlimited",
      storage_gb: "unlimited",
      users: "unlimited",
      integrations: "unlimited"
    },
    features: {
      core: [
        "Bespoke AI platform development",
        "Global infrastructure deployment",
        "C-level executive support",
        "Custom analytics platform",
        "Private cloud deployment",
        "Dedicated development team"
      ],
      automation: [
        "Custom AI model development",
        "Industry-specific algorithms",
        "Advanced research collaboration",
        "Proprietary optimization",
        "Custom hardware integration",
        "Edge computing deployment"
      ],
      security: [
        "Custom security architecture",
        "Government-grade compliance",
        "Private network deployment",
        "Custom audit requirements",
        "Isolated infrastructure",
        "Advanced threat protection"
      ],
      integrations: [
        "Complete system integration",
        "Legacy modernization",
        "Custom protocol development",
        "Real-time global sync",
        "Multi-vendor coordination"
      ],
      support: [
        "Dedicated engineering team",
        "C-level relationship management",
        "Custom SLA agreements",
        "On-site engineering support",
        "Priority development queue",
        "Executive business reviews"
      ]
    },
    target_market: "Fortune 100, government, global enterprises",
    estimated_users: 500,
    conversion_rate: 0.45
  }
};

// Additional Revenue Streams
export const additionalRevenue = {
  // API Monetization
  api_usage: {
    price_per_call: 0.01,
    volume_discounts: {
      tier1: { min_calls: 100000, discount: 0.1 },
      tier2: { min_calls: 1000000, discount: 0.2 },
      tier3: { min_calls: 10000000, discount: 0.3 }
    },
    estimated_monthly_calls: 50000000,
    estimated_monthly_revenue: 350000 // After discounts
  },

  // Professional Services
  professional_services: {
    implementation: {
      price_per_day: 2000,
      average_project_days: 30,
      projects_per_month: 25,
      monthly_revenue: 1500000
    },
    training: {
      price_per_day: 1500,
      average_training_days: 5,
      sessions_per_month: 40,
      monthly_revenue: 300000
    },
    consulting: {
      price_per_hour: 300,
      hours_per_month: 2000,
      monthly_revenue: 600000
    }
  },

  // Marketplace Commission
  marketplace: {
    commission_rate: 0.15,
    monthly_transactions: 5000000,
    estimated_monthly_revenue: 750000
  },

  // Premium Support
  premium_support: {
    enterprise_support: {
      annual_fee: 50000,
      customers: 500,
      annual_revenue: 25000000
    },
    dedicated_support: {
      annual_fee: 100000,
      customers: 200,
      annual_revenue: 20000000
    }
  },

  // Data Analytics & Insights
  data_services: {
    industry_reports: {
      price_per_report: 5000,
      reports_per_month: 100,
      monthly_revenue: 500000
    },
    custom_analytics: {
      setup_fee: 25000,
      monthly_fee: 5000,
      customers: 150,
      monthly_revenue: 750000
    }
  }
};

// Revenue Projections
export const revenueProjections = {
  year1: {
    subscription_revenue: 180000000, // $180M
    additional_revenue: 60000000,    // $60M
    total_revenue: 240000000,        // $240M
    growth_rate: 0.15
  },
  year2: {
    subscription_revenue: 324000000, // $324M
    additional_revenue: 108000000,   // $108M
    total_revenue: 432000000,        // $432M
    growth_rate: 0.8
  },
  year3: {
    subscription_revenue: 583200000, // $583M
    additional_revenue: 194400000,   // $194M
    total_revenue: 777600000,        // $778M
    growth_rate: 0.8
  },
  year4: {
    subscription_revenue: 874800000, // $875M
    additional_revenue: 291600000,   // $292M
    total_revenue: 1166400000,       // $1.17B
    growth_rate: 0.5
  },
  year5: {
    subscription_revenue: 1312200000, // $1.31B
    additional_revenue: 437400000,    // $437M
    total_revenue: 1749600000,        // $1.75B
    growth_rate: 0.5
  }
};

// Market Analysis
export const marketAnalysis = {
  total_addressable_market: 50000000000, // $50B
  serviceable_addressable_market: 15000000000, // $15B
  serviceable_obtainable_market: 3000000000,   // $3B
  
  competitive_landscape: {
    direct_competitors: [
      "UiPath", "Automation Anywhere", "Blue Prism"
    ],
    competitive_advantages: [
      "AI-first approach",
      "Multi-industry optimization",
      "Real-time learning",
      "Global scalability",
      "Enterprise security"
    ]
  },
  
  growth_drivers: [
    "Digital transformation acceleration",
    "Labor shortage in key industries",
    "Cost reduction pressure",
    "AI technology advancement",
    "Regulatory compliance automation"
  ]
};

// Key Performance Indicators
export const kpis = {
  customer_metrics: {
    customer_acquisition_cost: 5000,
    customer_lifetime_value: 150000,
    monthly_churn_rate: 0.02,
    net_revenue_retention: 1.25
  },
  
  business_metrics: {
    gross_margin: 0.85,
    operating_margin_target: 0.25,
    rule_of_40: 65, // Growth rate + profit margin
    magic_number: 1.5 // Sales efficiency
  },
  
  product_metrics: {
    daily_active_users: 125000,
    feature_adoption_rate: 0.75,
    api_usage_growth: 0.3, // Monthly
    customer_satisfaction: 4.7 // Out of 5
  }
};
