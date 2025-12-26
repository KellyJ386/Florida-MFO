import type { Measurement, MeasurementPoint } from '@/lib/types/database'

export function calculateMeasurementStatus(
  value: number,
  target: number,
  tolerance: number
): 'ideal' | 'warning' | 'critical' {
  const deviation = Math.abs(value - target)

  if (deviation <= tolerance * 0.5) {
    return 'ideal'
  } else if (deviation <= tolerance) {
    return 'warning'
  } else {
    return 'critical'
  }
}

export function getStatusColor(status: 'ideal' | 'warning' | 'critical'): string {
  switch (status) {
    case 'ideal':
      return '#22c55e'
    case 'warning':
      return '#eab308'
    case 'critical':
      return '#ef4444'
  }
}

export function formatDepth(value: number): string {
  return `${value.toFixed(2)}"`
}

export function calculateAverageDepth(measurements: Measurement[]): number {
  if (measurements.length === 0) return 0
  const sum = measurements.reduce((acc, m) => acc + m.value, 0)
  return sum / measurements.length
}

export function getIssueCount(measurements: Measurement[]): {
  ideal: number
  warning: number
  critical: number
} {
  return measurements.reduce(
    (acc, m) => {
      acc[m.status]++
      return acc
    },
    { ideal: 0, warning: 0, critical: 0 }
  )
}
