import { NextResponse } from 'next/server'

// Mock dashboard data for development
const mockDashboardData = {
  system: {
    status: 'operational',
    uptime: '99.9%',
    version: '2.0.0',
    last_updated: new Date().toISOString()
  },
  metrics: {
    total_tasks: 1247,
    active_tasks: 23,
    completed_tasks: 1224,
    success_rate: 98.5,
    avg_completion_time: '2.3s',
    total_agents: 15,
    active_agents: 12,
    total_robots: 5,
    active_robots: 4
  },
  services: {
    agent_selection: { status: 'healthy', response_time: '45ms' },
    robot_abstraction: { status: 'healthy', response_time: '32ms' },
    workflow_state: { status: 'healthy', response_time: '28ms' },
    learning_service: { status: 'healthy', response_time: '67ms' },
    healthcare_service: { status: 'healthy', response_time: '41ms' },
    iot_service: { status: 'healthy', response_time: '38ms' }
  },
  recent_activities: [
    {
      id: 1,
      type: 'task_completed',
      message: 'Healthcare patient triage completed successfully',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'success'
    },
    {
      id: 2,
      type: 'robot_connected',
      message: 'UR5e-001 robot connected to fleet',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      status: 'info'
    },
    {
      id: 3,
      type: 'agent_assigned',
      message: 'AI Agent assigned to IoT monitoring task',
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      status: 'success'
    },
    {
      id: 4,
      type: 'workflow_started',
      message: 'Multi-agent coordination workflow initiated',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      status: 'info'
    }
  ],
  performance: {
    cpu_usage: 45.2,
    memory_usage: 67.8,
    disk_usage: 34.1,
    network_io: {
      incoming: '2.3 MB/s',
      outgoing: '1.8 MB/s'
    }
  },
  alerts: [
    {
      id: 1,
      level: 'warning',
      message: 'High memory usage detected on Agent-007',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ],
  market_data: {
    healthcare_iot: {
      market_size: '$847B',
      growth_rate: '23.4%',
      our_position: 'Leading Innovation'
    },
    automation: {
      efficiency_gain: '40-60%',
      cost_savings: '$2M+ annually',
      roi: '340%'
    }
  }
}

export async function GET(request) {
  try {
    // In production, this would fetch real data from various services
    // For now, return mock data with some dynamic elements
    
    const dashboardData = {
      ...mockDashboardData,
      timestamp: new Date().toISOString(),
      metrics: {
        ...mockDashboardData.metrics,
        // Add some randomness to simulate real-time changes
        active_tasks: Math.floor(Math.random() * 10) + 20,
        active_agents: Math.floor(Math.random() * 3) + 10,
        active_robots: Math.floor(Math.random() * 2) + 3
      },
      performance: {
        ...mockDashboardData.performance,
        cpu_usage: Math.random() * 20 + 35,
        memory_usage: Math.random() * 15 + 60
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Handle dashboard actions like system pause/resume
    if (body.action === 'pause') {
      return NextResponse.json({ 
        success: true, 
        message: 'System paused successfully',
        status: 'paused'
      })
    }
    
    if (body.action === 'resume') {
      return NextResponse.json({ 
        success: true, 
        message: 'System resumed successfully',
        status: 'operational'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Dashboard POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process dashboard action' },
      { status: 500 }
    )
  }
}
