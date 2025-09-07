import { NextResponse } from 'next/server'

// Demo data for investor presentations
const generateDemoRobots = () => {
  return [
    {
      id: 'robot_001',
      name: 'Manufacturing Robot Alpha',
      type: 'industrial_arm',
      manufacturer: 'ABB',
      model: 'IRB 6700',
      status: 'active',
      location: 'Manufacturing Zone A',
      battery_level: 87,
      uptime: 99.8,
      tasks_completed: 1247,
      efficiency: 98.5,
      last_maintenance: '2024-01-15T10:30:00Z',
      capabilities: ['welding', 'assembly', 'material_handling'],
      performance_metrics: {
        cycle_time: 0.16,
        accuracy: 99.9,
        throughput: 6316
      }
    },
    {
      id: 'robot_002',
      name: 'Healthcare Assistant Beta',
      type: 'mobile_robot',
      manufacturer: 'TUG',
      model: 'T3',
      status: 'active',
      location: 'Hospital Ward B',
      battery_level: 72,
      uptime: 99.5,
      tasks_completed: 892,
      efficiency: 96.8,
      last_maintenance: '2024-01-20T14:15:00Z',
      capabilities: ['medication_delivery', 'supply_transport', 'patient_monitoring'],
      performance_metrics: {
        response_time: 0.12,
        accuracy: 99.7,
        patient_satisfaction: 98.2
      }
    },
    {
      id: 'robot_003',
      name: 'Logistics Coordinator Gamma',
      type: 'autonomous_vehicle',
      manufacturer: 'Amazon Robotics',
      model: 'Kiva',
      status: 'active',
      location: 'Warehouse Section C',
      battery_level: 94,
      uptime: 99.9,
      tasks_completed: 2156,
      efficiency: 97.3,
      last_maintenance: '2024-01-18T09:45:00Z',
      capabilities: ['inventory_management', 'order_fulfillment', 'warehouse_navigation'],
      performance_metrics: {
        pick_rate: 450,
        accuracy: 99.8,
        energy_efficiency: 95.5
      }
    }
  ]
}

export async function GET(request) {
  try {
    // Return demo data for investor presentations
    const robots = generateDemoRobots()

    return NextResponse.json({
      success: true,
      data: robots,
      total: robots.length,
      timestamp: new Date().toISOString(),
      demo_mode: true
    })
  } catch (error) {
    console.error('Error generating robot data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch robots', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Simulate robot registration for demo
    const newRobot = {
      id: `robot_${Date.now()}`,
      name: body.name || 'New Robot',
      type: body.type || 'industrial_arm',
      manufacturer: body.manufacturer || 'Demo Manufacturer',
      model: body.model || 'Demo Model',
      status: 'registered',
      location: body.location || 'Demo Location',
      battery_level: 100,
      uptime: 0,
      tasks_completed: 0,
      efficiency: 0,
      last_maintenance: new Date().toISOString(),
      capabilities: body.capabilities || ['basic_operations'],
      performance_metrics: {
        cycle_time: 0,
        accuracy: 0,
        throughput: 0
      },
      registration_time: new Date().toISOString(),
      demo_mode: true
    }

    return NextResponse.json({
      success: true,
      message: 'Robot registered successfully',
      data: newRobot,
      estimated_roi: {
        annual_savings: Math.floor(Math.random() * 500000) + 250000, // $250k-$750k
        payback_months: Math.floor(Math.random() * 12) + 6 // 6-18 months
      }
    })
  } catch (error) {
    console.error('Error registering robot:', error)
    return NextResponse.json(
      { error: 'Failed to register robot', details: error.message },
      { status: 500 }
    )
  }
}
