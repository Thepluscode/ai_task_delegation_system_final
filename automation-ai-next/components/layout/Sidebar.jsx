'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  Squares2X2Icon,
  CpuChipIcon,
  BeakerIcon,
  ClipboardDocumentListIcon,
  PuzzlePieceIcon,
  UsersIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  BanknotesIcon,
  CloudIcon,
  BuildingOffice2Icon,
  HeartIcon,
  CogIcon,
  ShoppingCartIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/helpers'
import { Badge } from '@/components/ui/Badge'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon,
    current: false,
  },
  {
    name: 'Industry Dashboards',
    icon: BuildingOffice2Icon,
    current: false,
    children: [
      {
        name: 'Healthcare',
        href: '/dashboard/healthcare',
        icon: HeartIcon,
        description: 'Patient care, social robots, HIPAA compliance',
        current: false,
      },
      {
        name: 'Manufacturing',
        href: '/dashboard/manufacturing',
        icon: CogIcon,
        description: 'Production control, quality management, OEE',
        current: false,
      },
      {
        name: 'Financial Services',
        href: '/dashboard/financial',
        icon: BanknotesIcon,
        description: 'Algorithmic trading, risk management, compliance',
        current: false,
      },
      {
        name: 'Retail & E-commerce',
        href: '/dashboard/retail',
        icon: ShoppingCartIcon,
        description: 'Customer service, personalization, inventory',
        current: false,
      },
      {
        name: 'Education',
        href: '/dashboard/education',
        icon: AcademicCapIcon,
        description: 'Personalized learning, educational robots',
        current: false,
      },
      {
        name: 'Logistics',
        href: '/dashboard/logistics',
        icon: TruckIcon,
        description: 'Warehouse automation, supply chain',
        current: false,
      },
    ],
  },
  {
    name: 'Workflows',
    href: '/workflows',
    icon: Squares2X2Icon,
    current: false,
    badge: '12',
    children: [
      { name: 'All Workflows', href: '/workflows' },
      { name: 'Designer', href: '/workflows/designer' },
      { name: 'Create New', href: '/workflows/create' },
      { name: 'Templates', href: '/workflows/templates' },
    ],
  },
  {
    name: 'Robots',
    href: '/robots',
    icon: CpuChipIcon,
    current: false,
    badge: '5',
    children: [
      { name: 'Fleet Overview', href: '/robots' },
      { name: 'Control Panel', href: '/robots/control' },
      { name: 'Connect Robot', href: '/robots/connect' },
      { name: 'Fleet Management', href: '/robots/fleet' },
    ],
  },
  {
    name: 'AI Models',
    href: '/ai',
    icon: BeakerIcon,
    current: false,
    children: [
      { name: 'Model Library', href: '/ai/models' },
      { name: 'Task Delegation', href: '/ai/delegation' },
      { name: 'Training', href: '/ai/training' },
    ],
  },
  {
    name: 'Learning Service',
    href: '/learning',
    icon: AcademicCapIcon,
    current: false,
    badge: 'AI',
    children: [
      { name: 'Dashboard', href: '/learning' },
      { name: 'Submit Feedback', href: '/learning?tab=feedback' },
      { name: 'Agent Rankings', href: '/learning?tab=agents' },
      { name: 'AI Insights', href: '/learning?tab=insights' },
    ],
  },
  {
    name: 'Banking Service',
    href: '/banking',
    icon: BanknotesIcon,
    current: false,
    badge: 'NEW',
    children: [
      { name: 'Analytics', href: '/banking' },
      { name: 'Loan Processor', href: '/banking?tab=processor' },
      { name: 'Agent Performance', href: '/banking?tab=agents' },
      { name: 'Service Test', href: '/banking?tab=test' },
    ],
  },
  {
    name: 'Edge Computing',
    href: '/edge',
    icon: CloudIcon,
    current: false,
    children: [
      { name: 'Performance Dashboard', href: '/edge' },
      { name: 'Task Processor', href: '/edge?tab=processor' },
      { name: 'Vision Processing', href: '/edge?tab=vision' },
    ],
  },
  {
    name: 'Smart Manufacturing',
    href: '/manufacturing',
    icon: BuildingOffice2Icon,
    current: false,
    badge: '$790B',
    children: [
      { name: 'Executive Dashboard', href: '/manufacturing' },
      { name: 'Fortune 500 Pipeline', href: '/manufacturing?tab=pipeline' },
      { name: 'AI Capabilities', href: '/manufacturing?tab=capabilities' },
      { name: 'Market Intelligence', href: '/manufacturing?tab=market' },
      { name: 'ROI Calculator', href: '/manufacturing?tab=roi' },
    ],
  },
  {
    name: 'IoT Platform',
    href: '/iot-platform',
    icon: CloudIcon,
    current: false,
    badge: '$714B',
    children: [
      { name: 'Platform Overview', href: '/iot-platform' },
      { name: 'Enterprise Customers', href: '/iot-platform?tab=customers' },
      { name: 'Predictive Maintenance', href: '/iot-platform?tab=predictive' },
      { name: 'Edge Infrastructure', href: '/iot-platform?tab=edge' },
      { name: 'Executive Dashboard', href: '/iot-platform?tab=executive' },
    ],
  },
  {
    name: 'Healthcare IoT',
    href: '/healthcare',
    icon: HeartIcon,
    current: false,
    badge: '$847B',
    children: [
      { name: 'Platform Overview', href: '/healthcare' },
      { name: 'IoT Devices', href: '/healthcare?tab=devices' },
      { name: 'Patient Monitoring', href: '/healthcare?tab=patients' },
      { name: 'Predictive Analytics', href: '/healthcare?tab=predictive' },
      { name: 'Market Intelligence', href: '/healthcare?tab=market' },
    ],
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: ClipboardDocumentListIcon,
    current: false,
    badge: '23',
    children: [
      { name: 'Task Queue', href: '/tasks/queue' },
      { name: 'History', href: '/tasks/history' },
      { name: 'Assignments', href: '/tasks/assignments' },
    ],
  },
  {
    name: 'Monitoring',
    href: '/monitoring',
    icon: BeakerIcon,
    current: false,
    badge: 'LIVE',
    children: [
      { name: 'System Health', href: '/monitoring' },
      { name: 'Performance', href: '/monitoring/performance' },
      { name: 'Alerts', href: '/monitoring/alerts' },
    ],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: AcademicCapIcon,
    current: false,
    badge: 'AI',
    children: [
      { name: 'Insights', href: '/analytics' },
      { name: 'Reports', href: '/analytics/reports' },
      { name: 'Trends', href: '/analytics/trends' },
    ],
  },
  {
    name: 'Administration',
    href: '/admin',
    icon: Cog6ToothIcon,
    current: false,
    children: [
      { name: 'System Admin', href: '/admin' },
      { name: 'User Management', href: '/admin/users' },
      { name: 'Security', href: '/admin/security' },
    ],
  },
  {
    name: 'Integrations',
    href: '/integrations',
    icon: PuzzlePieceIcon,
    current: false,
    children: [
      { name: 'Integration Hub', href: '/integrations' },
      { name: 'API Keys', href: '/integrations/api-keys' },
      { name: 'Webhooks', href: '/integrations/webhooks' },
    ],
  },
  {
    name: 'Users',
    href: '/users',
    icon: UsersIcon,
    current: false,
    children: [
      { name: 'User Management', href: '/users' },
      { name: 'Roles', href: '/users/roles' },
      { name: 'Permissions', href: '/users/permissions' },
    ],
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCardIcon,
    current: false,
    children: [
      { name: 'Overview', href: '/billing' },
      { name: 'Plans', href: '/billing/plans' },
      { name: 'Usage', href: '/billing/usage' },
      { name: 'Invoices', href: '/billing/invoices' },
    ],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    current: false,
    children: [
      { name: 'General', href: '/settings' },
      { name: 'Profile', href: '/settings/profile' },
      { name: 'Organization', href: '/settings/organization' },
      { name: 'Security', href: '/settings/security' },
      { name: 'Notifications', href: '/settings/notifications' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState(['workflows', 'robots'])

  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => 
      prev.includes(itemName.toLowerCase())
        ? prev.filter(item => item !== itemName.toLowerCase())
        : [...prev, itemName.toLowerCase()]
    )
  }

  const isActive = (href) => {
    if (!href || href === '#') {
      return false
    }
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const isExpanded = (itemName) => {
    return expandedItems.includes(itemName.toLowerCase())
  }

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16">
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isItemActive = isActive(item.href)
              const isItemExpanded = isExpanded(item.name)
              const hasChildren = item.children && item.children.length > 0

              return (
                <div key={item.name}>
                  <div
                    className={cn(
                      'group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isItemActive
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <Link
                      href={item.href || '#'}
                      className="flex items-center flex-1"
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          isItemActive
                            ? 'text-primary-500'
                            : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                        )}
                      />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <Badge 
                          variant={isItemActive ? 'primary' : 'secondary'}
                          size="sm"
                          className="ml-2"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                    
                    {hasChildren && (
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {isItemExpanded ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Submenu */}
                  {hasChildren && isItemExpanded && (
                    <div className="mt-1 ml-8 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = isActive(child.href)
                        return (
                          <Link
                            key={child.name}
                            href={child.href || '#'}
                            className={cn(
                              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                              isChildActive
                                ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
                            )}
                          >
                            <span className="truncate">{child.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-success-500 to-ai-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                System Status
              </p>
              <p className="text-xs text-success-600 dark:text-success-400">
                All systems operational
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
