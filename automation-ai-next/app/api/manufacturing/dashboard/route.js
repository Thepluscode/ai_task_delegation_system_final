import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const line = searchParams.get('line') || 'all'

  try {
    // Simulate manufacturing dashboard data
    const manufacturingData = {
      oeeScore: 0.847,
      unitsProduced: 15420,
      qualityRate: 0.976,
      equipmentUptime: 0.934,
      
      // Production data
      productionData: [
        { hour: '06:00', unitsProduced: 1250, efficiency: 85 },
        { hour: '07:00', unitsProduced: 1380, efficiency: 88 },
        { hour: '08:00', unitsProduced: 1420, efficiency: 90 },
        { hour: '09:00', unitsProduced: 1450, efficiency: 92 },
        { hour: '10:00', unitsProduced: 1480, efficiency: 94 },
        { hour: '11:00', unitsProduced: 1520, efficiency: 96 },
        { hour: '12:00', unitsProduced: 1350, efficiency: 86 },
        { hour: '13:00', unitsProduced: 1400, efficiency: 89 },
        { hour: '14:00', unitsProduced: 1470, efficiency: 93 },
        { hour: '15:00', unitsProduced: 1510, efficiency: 95 },
        { hour: '16:00', unitsProduced: 1490, efficiency: 94 },
        { hour: '17:00', unitsProduced: 1460, efficiency: 92 }
      ],
      
      // Order status
      orderStatus: [
        { name: 'In Progress', value: 45, color: '#3B82F6' },
        { name: 'Completed', value: 38, color: '#10B981' },
        { name: 'Pending', value: 12, color: '#F59E0B' },
        { name: 'On Hold', value: 5, color: '#EF4444' }
      ],
      
      // Production lines
      productionLines: [
        {
          name: 'Line A',
          status: 'running',
          currentOrder: 'ORD-2024-001',
          progress: 78,
          rate: 1520
        },
        {
          name: 'Line B',
          status: 'running',
          currentOrder: 'ORD-2024-002',
          progress: 65,
          rate: 1480
        },
        {
          name: 'Line C',
          status: 'maintenance',
          currentOrder: 'ORD-2024-003',
          progress: 45,
          rate: 0
        }
      ],
      
      // Quality trends
      qualityTrends: [
        { date: '2024-01-01', passRate: 97.2, defectRate: 2.8, reworkRate: 1.5 },
        { date: '2024-01-02', passRate: 97.5, defectRate: 2.5, reworkRate: 1.3 },
        { date: '2024-01-03', passRate: 97.8, defectRate: 2.2, reworkRate: 1.2 },
        { date: '2024-01-04', passRate: 97.6, defectRate: 2.4, reworkRate: 1.4 },
        { date: '2024-01-05', passRate: 97.9, defectRate: 2.1, reworkRate: 1.1 },
        { date: '2024-01-06', passRate: 98.1, defectRate: 1.9, reworkRate: 1.0 },
        { date: '2024-01-07', passRate: 97.6, defectRate: 2.4, reworkRate: 1.3 }
      ],
      
      // Defect analysis
      defectAnalysis: [
        { category: 'Dimensional', count: 45 },
        { category: 'Surface Finish', count: 32 },
        { category: 'Material', count: 28 },
        { category: 'Assembly', count: 22 },
        { category: 'Electrical', count: 18 }
      ],
      
      // Quality stations
      qualityStations: [
        {
          name: 'QC Station 1',
          status: 'active',
          inspectionsToday: 247,
          passRate: 97.8,
          avgInspectionTime: 45
        },
        {
          name: 'QC Station 2',
          status: 'active',
          inspectionsToday: 198,
          passRate: 98.2,
          avgInspectionTime: 42
        },
        {
          name: 'QC Station 3',
          status: 'maintenance',
          inspectionsToday: 0,
          passRate: 0,
          avgInspectionTime: 0
        }
      ],
      
      // OEE breakdown
      oeeBreakdown: [
        { name: 'Availability', value: 93.4, fill: '#10B981' },
        { name: 'Performance', value: 89.2, fill: '#3B82F6' },
        { name: 'Quality', value: 97.6, fill: '#F59E0B' }
      ],
      
      availability: 0.934,
      performance: 0.892,
      quality: 0.976,
      
      // OEE trends
      oeeTrends: [
        { date: '2024-01-01', line1: 82.5, line2: 85.2, line3: 78.9 },
        { date: '2024-01-02', line1: 83.1, line2: 86.0, line3: 79.5 },
        { date: '2024-01-03', line1: 84.2, line2: 86.8, line3: 80.2 },
        { date: '2024-01-04', line1: 83.8, line2: 85.9, line3: 79.8 },
        { date: '2024-01-05', line1: 85.0, line2: 87.2, line3: 81.1 },
        { date: '2024-01-06', line1: 84.7, line2: 86.5, line3: 80.8 },
        { date: '2024-01-07', line1: 85.3, line2: 87.8, line3: 81.5 }
      ],
      
      // Maintenance alerts
      maintenanceAlerts: [
        {
          equipment: 'CNC Machine #3',
          issue: 'Spindle bearing wear detected',
          priority: 'high',
          daysUntilMaintenance: 3
        },
        {
          equipment: 'Conveyor Belt A',
          issue: 'Belt tension adjustment needed',
          priority: 'medium',
          daysUntilMaintenance: 7
        },
        {
          equipment: 'Robot Arm #2',
          issue: 'Calibration drift detected',
          priority: 'low',
          daysUntilMaintenance: 14
        }
      ],
      
      // Maintenance schedule
      maintenanceSchedule: [
        {
          equipment: 'Press Machine #1',
          type: 'Preventive Maintenance',
          scheduledDate: '2024-01-10',
          estimatedDuration: '4 hours'
        },
        {
          equipment: 'Welding Station #4',
          type: 'Calibration',
          scheduledDate: '2024-01-12',
          estimatedDuration: '2 hours'
        },
        {
          equipment: 'Quality Scanner #2',
          type: 'Software Update',
          scheduledDate: '2024-01-15',
          estimatedDuration: '1 hour'
        }
      ],
      
      // Waste analysis
      wasteAnalysis: [
        { wasteType: 'Overproduction', impact: 25, improvementPotential: 18 },
        { wasteType: 'Waiting', impact: 20, improvementPotential: 15 },
        { wasteType: 'Transportation', impact: 15, improvementPotential: 12 },
        { wasteType: 'Defects', impact: 18, improvementPotential: 14 },
        { wasteType: 'Inventory', impact: 12, improvementPotential: 8 },
        { wasteType: 'Motion', impact: 10, improvementPotential: 7 }
      ],
      
      // Lean metrics
      leanMetrics: {
        cycleTime: 45,
        leadTime: 72
      },
      
      // Lean opportunities
      leanOpportunities: [
        {
          area: 'Setup Time Reduction',
          recommendation: 'Implement SMED methodology',
          potentialSavings: 125
        },
        {
          area: 'Inventory Optimization',
          recommendation: 'Implement JIT delivery',
          potentialSavings: 85
        },
        {
          area: 'Quality Improvement',
          recommendation: 'Deploy Poka-yoke devices',
          potentialSavings: 95
        }
      ],
      
      // Scheduling
      scheduling: {
        totalOrders: 47,
        onTimeDelivery: 0.94,
        resourceUtilization: 0.87
      },
      
      // Upcoming schedule
      upcomingSchedule: [
        {
          orderNumber: 'ORD-2024-008',
          product: 'Widget A',
          quantity: 1500,
          scheduledStart: '08:00',
          assignedLine: 'A',
          priority: 'high'
        },
        {
          orderNumber: 'ORD-2024-009',
          product: 'Component B',
          quantity: 2200,
          scheduledStart: '10:30',
          assignedLine: 'B',
          priority: 'medium'
        },
        {
          orderNumber: 'ORD-2024-010',
          product: 'Assembly C',
          quantity: 800,
          scheduledStart: '14:00',
          assignedLine: 'A',
          priority: 'low'
        }
      ]
    }

    return NextResponse.json(manufacturingData)
  } catch (error) {
    console.error('Error fetching manufacturing dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manufacturing data' },
      { status: 500 }
    )
  }
}
