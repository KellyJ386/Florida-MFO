'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { RinkDiagram } from '@/components/ice-depth/RinkDiagram'
import { MeasurementForm } from '@/components/ice-depth/MeasurementForm'
import type { MeasurementPoint, Measurement } from '@/lib/types/database'
import type { Database } from '@/lib/types/database'

type IceDepthTemplate = Database['public']['Tables']['ice_depth_templates']['Row']

export default function MeasurePage() {
  const [template, setTemplate] = useState<IceDepthTemplate | null>(null)
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [currentPointIndex, setCurrentPointIndex] = useState(0)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const supabase = createClient()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId)
    }
  }, [templateId])

  const fetchTemplate = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('ice_depth_templates')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setTemplate(data)
      setMeasurementPoints(data.measurement_points as MeasurementPoint[])
    } catch (error) {
      console.error('Error fetching template:', error)
      alert('Failed to load template')
      router.push('/ice-depth')
    } finally {
      setLoading(false)
    }
  }

  const handleMeasurementSubmit = (measurement: Measurement) => {
    setMeasurements([...measurements, measurement])

    // Move to next point
    if (currentPointIndex < measurementPoints.length - 1) {
      setCurrentPointIndex(currentPointIndex + 1)
    }
  }

  const handleSkip = () => {
    if (currentPointIndex < measurementPoints.length - 1) {
      setCurrentPointIndex(currentPointIndex + 1)
    }
  }

  const handleSave = async () => {
    if (!user || !template) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('ice_depth_measurements')
        .insert({
          template_id: template.id,
          recorded_by: user.id,
          measurement_date: new Date().toISOString(),
          measurements: measurements as any,
          notes,
        })

      if (error) throw error

      alert('Measurements saved successfully!')
      router.push('/ice-depth')
    } catch (error) {
      console.error('Error saving measurements:', error)
      alert('Failed to save measurements')
    } finally {
      setSaving(false)
    }
  }

  const handlePointClick = (point: MeasurementPoint) => {
    const index = measurementPoints.findIndex(p => p.id === point.id)
    setCurrentPointIndex(index)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return null
  }

  const currentPoint = measurementPoints[currentPointIndex]
  const progress = (measurements.length / measurementPoints.length) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {measurements.length} / {measurementPoints.length} points
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Rink Diagram */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Rink Diagram</h2>
            <RinkDiagram
              svgContent={template.rink_svg}
              measurementPoints={measurementPoints}
              measurements={measurements}
              onPointClick={handlePointClick}
              highlightedPoint={currentPoint?.id}
            />
          </div>

          {/* Measurement Form */}
          <div className="space-y-6">
            {currentPoint && (
              <MeasurementForm
                point={currentPoint}
                onSubmit={handleMeasurementSubmit}
                onSkip={handleSkip}
                currentIndex={currentPointIndex}
                totalPoints={measurementPoints.length}
              />
            )}

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any observations or notes..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving || measurements.length === 0}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Measurements'}
              </button>
              <button
                onClick={() => router.push('/ice-depth')}
                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
