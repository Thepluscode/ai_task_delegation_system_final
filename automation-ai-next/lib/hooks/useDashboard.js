import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json())

export function useDashboard() {
  const { data, error, mutate } = useSWR('/api/dashboard', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  })

  // Mock data for development
  const mockData = {
    metrics: {
      totalTasks: 1247,
      activeTasks: 89,
      completedTasks: 1158,
      successRate: 94.2,
      avgProcessingTime: 2.3,
      systemUptime: 99.97,
      activeAgents: 12,
      queuedTasks: 23
    },
    performance: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      datasets: [
        {
          label: 'Tasks Processed',
          data: [45, 67, 89, 123, 156, 134],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
        {
          label: 'Success Rate %',
          data: [92, 94, 96, 95, 97, 94],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
        }
      ]
    },
    tasks: {
      labels: ['Banking', 'Healthcare', 'Retail', 'Manufacturing', 'IoT'],
      datasets: [{
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ]
      }]
    },
    workflows: [
      { id: 1, name: 'Banking Automation', status: 'active', progress: 87, tasks: 45 },
      { id: 2, name: 'Healthcare Processing', status: 'active', progress: 92, tasks: 23 },
      { id: 3, name: 'Retail Analytics', status: 'paused', progress: 65, tasks: 12 },
      { id: 4, name: 'IoT Data Processing', status: 'active', progress: 78, tasks: 34 }
    ],
    robots: [
      { id: 1, name: 'Banking Bot Alpha', status: 'active', utilization: 85, tasks: 12 },
      { id: 2, name: 'Healthcare Bot Beta', status: 'active', utilization: 92, tasks: 8 },
      { id: 3, name: 'Retail Bot Gamma', status: 'maintenance', utilization: 0, tasks: 0 },
      { id: 4, name: 'IoT Bot Delta', status: 'active', utilization: 67, tasks: 15 }
    ],
    system: {
      cpu: 67,
      memory: 78,
      disk: 45,
      network: 89,
      temperature: 42,
      uptime: '15d 7h 23m'
    },
    realtime: {
      recentTasks: [
        { id: 1, type: 'Banking', status: 'completed', timestamp: new Date(Date.now() - 1000 * 60 * 2) },
        { id: 2, type: 'Healthcare', status: 'processing', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
        { id: 3, type: 'Retail', status: 'completed', timestamp: new Date(Date.now() - 1000 * 60 * 8) },
        { id: 4, type: 'IoT', status: 'failed', timestamp: new Date(Date.now() - 1000 * 60 * 12) },
        { id: 5, type: 'Banking', status: 'completed', timestamp: new Date(Date.now() - 1000 * 60 * 15) }
      ],
      alerts: [
        { id: 1, type: 'warning', message: 'High memory usage detected', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
        { id: 2, type: 'info', message: 'New agent registered', timestamp: new Date(Date.now() - 1000 * 60 * 30) }
      ]
    }
  }

  return {
    data: data || mockData,
    isLoading: !error && !data,
    error,
    mutate
  }
}
