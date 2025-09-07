import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const warehouse = searchParams.get('warehouse') || 'all'

  try {
    // Simulate logistics alerts data
    const alertsData = {
      alerts: [
        {
          id: 'LOG-001',
          type: 'delivery_delay',
          location: 'Route 47 - Downtown',
          message: 'Traffic congestion causing 45-minute delay for 12 packages',
          timestamp: '2 minutes ago',
          severity: 'medium',
          affectedPackages: 12,
          estimatedDelay: 45
        },
        {
          id: 'LOG-002',
          type: 'inventory_shortage',
          location: 'Warehouse A - Electronics',
          message: 'Low stock alert: Premium headphones below reorder point',
          timestamp: '8 minutes ago',
          severity: 'high',
          currentStock: 45,
          reorderPoint: 75
        },
        {
          id: 'LOG-003',
          type: 'route_optimization',
          location: 'Fleet Management',
          message: 'AI suggests route optimization for 15% fuel savings',
          timestamp: '15 minutes ago',
          severity: 'low',
          potentialSavings: 0.15,
          affectedRoutes: 8
        },
        {
          id: 'LOG-004',
          type: 'equipment_maintenance',
          location: 'Warehouse B - Sorting System',
          message: 'Conveyor belt #3 requires scheduled maintenance in 2 hours',
          timestamp: '22 minutes ago',
          severity: 'medium',
          maintenanceWindow: '2 hours',
          impactedThroughput: 0.25
        },
        {
          id: 'LOG-005',
          type: 'weather_alert',
          location: 'Regional Operations',
          message: 'Severe weather warning may impact drone deliveries',
          timestamp: '35 minutes ago',
          severity: 'high',
          affectedDrones: 12,
          alternativeRoutes: 5
        },
        {
          id: 'LOG-006',
          type: 'capacity_warning',
          location: 'Warehouse C - Loading Dock',
          message: 'Loading dock approaching 95% capacity utilization',
          timestamp: '1 hour ago',
          severity: 'medium',
          currentUtilization: 0.95,
          recommendedAction: 'Schedule additional shifts'
        },
        {
          id: 'LOG-007',
          type: 'security_incident',
          location: 'Perimeter - Gate 2',
          message: 'Unauthorized vehicle detected near loading area',
          timestamp: '1 hour 15 minutes ago',
          severity: 'high',
          securityResponse: 'dispatched',
          cameraFootage: 'available'
        },
        {
          id: 'LOG-008',
          type: 'quality_issue',
          location: 'Quality Control Station',
          message: 'Damaged packages detected in shipment #QC-4567',
          timestamp: '1 hour 30 minutes ago',
          severity: 'medium',
          affectedPackages: 8,
          quarantineStatus: 'isolated'
        },
        {
          id: 'LOG-009',
          type: 'fuel_alert',
          location: 'Fleet Vehicle TRK-045',
          message: 'Vehicle fuel level below 15% - refueling required',
          timestamp: '2 hours ago',
          severity: 'low',
          currentFuelLevel: 0.12,
          nearestStation: '2.3 miles'
        },
        {
          id: 'LOG-010',
          type: 'performance_anomaly',
          location: 'Robotic Picking System',
          message: 'Picking efficiency dropped 12% below normal range',
          timestamp: '2 hours 15 minutes ago',
          severity: 'medium',
          efficiencyDrop: 0.12,
          diagnosticsStatus: 'running'
        }
      ],
      summary: {
        total: 10,
        high: 3,
        medium: 5,
        low: 2,
        resolved: 0,
        pending: 10
      },
      categories: {
        delivery_delay: 1,
        inventory_shortage: 1,
        route_optimization: 1,
        equipment_maintenance: 1,
        weather_alert: 1,
        capacity_warning: 1,
        security_incident: 1,
        quality_issue: 1,
        fuel_alert: 1,
        performance_anomaly: 1
      }
    }

    return NextResponse.json(alertsData)
  } catch (error) {
    console.error('Error fetching logistics alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logistics alerts' },
      { status: 500 }
    )
  }
}
