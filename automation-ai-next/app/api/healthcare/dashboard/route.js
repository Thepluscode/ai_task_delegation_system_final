import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const facility = searchParams.get('facility') || 'all'

  try {
    // Simulate healthcare dashboard data
    const healthcareData = {
      activePatients: 1247,
      patientCapacity: 78,
      activeSocialRobots: 24,
      robotUtilization: 85,
      averageWaitTime: 18, // minutes
      safetyScore: 0.96,
      
      // Patient flow data
      patientFlowData: [
        { time: '06:00', admissions: 12, discharges: 8, transfers: 3 },
        { time: '08:00', admissions: 25, discharges: 15, transfers: 7 },
        { time: '10:00', admissions: 35, discharges: 22, transfers: 12 },
        { time: '12:00', admissions: 42, discharges: 28, transfers: 15 },
        { time: '14:00', admissions: 38, discharges: 32, transfers: 18 },
        { time: '16:00', admissions: 30, discharges: 35, transfers: 14 },
        { time: '18:00', admissions: 20, discharges: 25, transfers: 8 },
        { time: '20:00', admissions: 15, discharges: 18, transfers: 5 }
      ],
      
      // Room utilization
      roomUtilization: [
        { department: 'ICU', utilization: 92, capacity: 100 },
        { department: 'Emergency', utilization: 85, capacity: 100 },
        { department: 'Surgery', utilization: 78, capacity: 100 },
        { department: 'General', utilization: 72, capacity: 100 },
        { department: 'Pediatrics', utilization: 65, capacity: 100 }
      ],
      
      // Flow bottlenecks
      flowBottlenecks: [
        {
          location: 'Emergency Department',
          issue: 'High patient volume causing delays',
          impact: 'High',
          recommendation: 'Deploy additional triage robots'
        },
        {
          location: 'Radiology',
          issue: 'Equipment maintenance scheduled',
          impact: 'Medium',
          recommendation: 'Reschedule non-urgent scans'
        },
        {
          location: 'Pharmacy',
          issue: 'Medication dispensing backlog',
          impact: 'Medium',
          recommendation: 'Activate automated dispensing system'
        }
      ],
      
      // Robot interactions
      robotInteractions: [
        { hour: '06:00', companionSessions: 15, medicationReminders: 45, cognitiveAssessments: 8 },
        { hour: '08:00', companionSessions: 28, medicationReminders: 62, cognitiveAssessments: 12 },
        { hour: '10:00', companionSessions: 35, medicationReminders: 78, cognitiveAssessments: 18 },
        { hour: '12:00', companionSessions: 42, medicationReminders: 85, cognitiveAssessments: 22 },
        { hour: '14:00', companionSessions: 38, medicationReminders: 72, cognitiveAssessments: 20 },
        { hour: '16:00', companionSessions: 32, medicationReminders: 68, cognitiveAssessments: 15 },
        { hour: '18:00', companionSessions: 25, medicationReminders: 55, cognitiveAssessments: 10 },
        { hour: '20:00', companionSessions: 18, medicationReminders: 42, cognitiveAssessments: 6 }
      ],
      
      // Robot performance
      robotPerformance: [
        {
          name: 'Companion-01',
          location: 'Ward A',
          status: 'active',
          interactionsToday: 47,
          satisfactionScore: 0.94
        },
        {
          name: 'MedBot-03',
          location: 'Pharmacy',
          status: 'active',
          interactionsToday: 128,
          satisfactionScore: 0.97
        },
        {
          name: 'CogniBot-02',
          location: 'Therapy Room',
          status: 'active',
          interactionsToday: 23,
          satisfactionScore: 0.91
        }
      ],
      
      // Fall detection
      fallDetection: {
        monitored: 847,
        incidents: 3,
        accuracy: 0.987
      },
      
      // Emergency response
      emergencyResponse: [
        { type: 'Fall Alert', responseTime: 45 },
        { type: 'Medical Emergency', responseTime: 32 },
        { type: 'Code Blue', responseTime: 28 },
        { type: 'Security Alert', responseTime: 52 }
      ],
      
      // Cognitive assessments
      cognitiveAssessments: [
        { date: '2024-01-01', memoryScore: 78, attentionScore: 82, executiveScore: 75 },
        { date: '2024-01-02', memoryScore: 79, attentionScore: 83, executiveScore: 76 },
        { date: '2024-01-03', memoryScore: 80, attentionScore: 84, executiveScore: 77 },
        { date: '2024-01-04', memoryScore: 81, attentionScore: 85, executiveScore: 78 },
        { date: '2024-01-05', memoryScore: 82, attentionScore: 86, executiveScore: 79 },
        { date: '2024-01-06', memoryScore: 83, attentionScore: 87, executiveScore: 80 },
        { date: '2024-01-07', memoryScore: 84, attentionScore: 88, executiveScore: 81 }
      ],
      
      // Assessment distribution
      assessmentDistribution: [
        { name: 'Excellent', value: 35, color: '#10B981' },
        { name: 'Good', value: 42, color: '#3B82F6' },
        { name: 'Fair', value: 18, color: '#F59E0B' },
        { name: 'Needs Improvement', value: 5, color: '#EF4444' }
      ],
      
      // Compliance status
      complianceStatus: [
        { requirement: 'Patient Data Encryption', status: 'compliant' },
        { requirement: 'Access Control Logs', status: 'compliant' },
        { requirement: 'Audit Trail Maintenance', status: 'compliant' },
        { requirement: 'Staff Training Records', status: 'compliant' },
        { requirement: 'Incident Reporting', status: 'compliant' }
      ],
      
      // Audit trail
      auditTrail: [
        { action: 'Patient record accessed', timestamp: '2024-01-07 14:30', user: 'Dr. Smith' },
        { action: 'Medication order updated', timestamp: '2024-01-07 14:25', user: 'Nurse Johnson' },
        { action: 'Robot interaction logged', timestamp: '2024-01-07 14:20', user: 'System' },
        { action: 'Fall detection alert', timestamp: '2024-01-07 14:15', user: 'Safety System' }
      ]
    }

    return NextResponse.json(healthcareData)
  } catch (error) {
    console.error('Error fetching healthcare dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch healthcare data' },
      { status: 500 }
    )
  }
}
