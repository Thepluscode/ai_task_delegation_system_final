'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

export default function BillingPlansPage() {
  const [currentPlan, setCurrentPlan] = useState('enterprise')
  const [billingCycle, setBillingCycle] = useState('annual')

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small teams getting started with AI automation',
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        'Up to 5 AI agents',
        '1,000 tasks per month',
        'Basic analytics',
        'Email support',
        'Standard integrations',
        '99.5% uptime SLA'
      ],
      limitations: [
        'Limited to 3 workflows',
        'Basic reporting only',
        'Community support'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing businesses scaling their automation',
      monthlyPrice: 299,
      annualPrice: 2990,
      features: [
        'Up to 25 AI agents',
        '10,000 tasks per month',
        'Advanced analytics',
        'Priority support',
        'All integrations',
        '99.9% uptime SLA',
        'Custom workflows',
        'API access',
        'Team collaboration'
      ],
      limitations: [
        'Limited to 50 workflows',
        'Standard reporting'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Complete solution for large organizations with unlimited scale',
      monthlyPrice: 999,
      annualPrice: 9990,
      features: [
        'Unlimited AI agents',
        'Unlimited tasks',
        'Real-time analytics',
        '24/7 dedicated support',
        'Custom integrations',
        '99.99% uptime SLA',
        'Unlimited workflows',
        'Full API access',
        'Advanced security',
        'Custom training',
        'Dedicated account manager',
        'White-label options'
      ],
      limitations: [],
      popular: false
    },
    {
      id: 'custom',
      name: 'Custom Enterprise',
      description: 'Tailored solution for Fortune 500 companies',
      monthlyPrice: null,
      annualPrice: null,
      features: [
        'Everything in Enterprise',
        'Custom AI model development',
        'On-premise deployment',
        'Dedicated infrastructure',
        'Custom SLA agreements',
        'Regulatory compliance',
        'Advanced security audits',
        'Custom integrations',
        'Executive support',
        'Training & consulting'
      ],
      limitations: [],
      popular: false
    }
  ]

  const getPrice = (plan) => {
    if (!plan.monthlyPrice) return 'Custom Pricing'
    const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice
    const period = billingCycle === 'annual' ? '/year' : '/month'
    return `$${price.toLocaleString()}${period}`
  }

  const getSavings = (plan) => {
    if (!plan.monthlyPrice) return null
    const monthlyCost = plan.monthlyPrice * 12
    const savings = monthlyCost - plan.annualPrice
    const percentage = Math.round((savings / monthlyCost) * 100)
    return { amount: savings, percentage }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your <span className="text-blue-600">$1B Automation</span> Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Scale your business with enterprise-grade AI automation. Join Fortune 500 companies 
          already saving millions with our platform.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingCycle === 'annual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Annual
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Save up to 17%
            </span>
          </button>
        </div>
      </div>

      {/* Current Plan Alert */}
      {currentPlan && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-800 max-w-2xl mx-auto">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          You are currently on the <strong>{plans.find(p => p.id === currentPlan)?.name}</strong> plan.
        </Alert>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const savings = getSavings(plan)
          const isCurrentPlan = plan.id === currentPlan
          
          return (
            <Card
              key={plan.id}
              className={`relative p-6 ${
                plan.popular
                  ? 'ring-2 ring-blue-500 shadow-xl scale-105'
                  : isCurrentPlan
                  ? 'ring-2 ring-green-500'
                  : 'hover:shadow-lg'
              } transition-all duration-200`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold text-gray-900">
                    {getPrice(plan)}
                  </div>
                  {savings && billingCycle === 'annual' && (
                    <div className="text-sm text-green-600 font-medium">
                      Save ${savings.amount.toLocaleString()} ({savings.percentage}%)
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Features included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-sm text-gray-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {isCurrentPlan ? (
                  <Button disabled className="w-full bg-green-600 text-white">
                    Current Plan
                  </Button>
                ) : plan.id === 'custom' ? (
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Contact Sales
                  </Button>
                ) : (
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {plan.id === 'enterprise' ? 'Upgrade to Enterprise' : 'Choose Plan'}
                  </Button>
                )}
                
                {plan.id !== 'custom' && (
                  <Button variant="outline" className="w-full">
                    Start Free Trial
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Enterprise Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Fortune 500 Companies Choose Our Enterprise Platform
          </h2>
          <p className="text-lg text-gray-600">
            Join industry leaders who have transformed their operations with our $1B automation platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">40-60% Efficiency Gains</h3>
            <p className="text-gray-600">Automate complex workflows and reduce manual tasks across all departments</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">$2M+ Annual Savings</h3>
            <p className="text-gray-600">Reduce operational costs through intelligent automation and optimization</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
            <p className="text-gray-600">SOC 2, GDPR, and ISO 27001 compliant with advanced security features</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans at any time?</h3>
            <p className="text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, 
              and we'll prorate any billing adjustments.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What's included in the free trial?</h3>
            <p className="text-gray-600">
              All plans include a 30-day free trial with full access to features. No credit card required 
              to start, and you can cancel anytime during the trial period.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer custom enterprise solutions?</h3>
            <p className="text-gray-600">
              Yes, we work with Fortune 500 companies to create custom solutions including on-premise 
              deployment, custom AI models, and dedicated infrastructure. Contact our enterprise team for details.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">What kind of support do you provide?</h3>
            <p className="text-gray-600">
              Support varies by plan: Starter includes email support, Professional gets priority support, 
              and Enterprise customers receive 24/7 dedicated support with a dedicated account manager.
            </p>
          </Card>
        </div>
      </div>

      {/* Contact Sales CTA */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 rounded-2xl p-8 text-center text-white max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
        <p className="text-xl mb-6 text-gray-300">
          Join thousands of companies already saving millions with AI automation
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-3">
            Start Free Trial
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3">
            Schedule Demo
          </Button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          No credit card required • 30-day free trial • Cancel anytime
        </p>
      </div>
    </div>
  )
}
