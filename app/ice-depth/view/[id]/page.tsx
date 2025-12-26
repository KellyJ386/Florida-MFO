'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RinkDiagram } from '@/components/ice-depth/RinkDiagram'
import { generateIceDepthPDF, downloadPDF } from '@/lib/utils/pdf-generator'
import { getIssueCount, calculateAverageDepth, formatDepth } from '@/lib/utils/measurements'
import { Download, ArrowLeft, Edit, Trash2 } from 'lucide-react'
import type { Measurement, MeasurementPoint } from '@/lib/types/database'
import type { Database } from '@/lib/types/database'

type IceDepthMeasurement = Database['public']['Tables']['ice_depth_measurements']['Row']
type IceDepthTemplate = Database['public']['Tables']['ice_depth_templates']['Row']

export default function ViewMeasurementPage() {
  const [measurement, setMeasurement] = useState<IceDepthMeasurement | null>(null)
  const [template, setTemplate] = useState<IceDepthTemplate | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const params = useParams()
  const measurementId = params.id as string
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchMeasurement()
  }, [measurementId])

  const fetchMeasurement = async () => {
    try {
      const { data: measurementData, error: measurementError } = await supabase
        .from('ice_depth_measurements')
        .select('*')
        .eq('id', measurementId)
        .single()

      if (measurementError) throw measurementError

      setMeasurement(measurementData)

      // Fetch template
      const { data: templateData, error: templateError } = await supabase
        .from('ice_depth_templates')
        .select('*')
        .eq('id', measurementData.template_id)
        .single()

      if (templateError) throw templateError
      setTemplate(templateData)

      // Fetch user email
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', measurementData.recorded_by)
        .single()

      if (profileData) setUserEmail(profileData.email)
    } catch (error) {
      console.error('Error fetching measurement:', error)
      alert('Failed to load measurement')
      router.push('/ice-depth')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!measurement || !template) return

    setExporting(true)
    try {
      const measurements = measurement.measurements as Measurement[]
      const measurementPoints = template.measurement_points as MeasurementPoint[]

      const pdf = await generateIceDepthPDF(
        template.name,
        measurement.measurement_date,
        measurements,
        measurementPoints,
        measurement.notes || undefined,
        userEmail
      )

      await downloadPDF(
        pdf,
        `ice-depth-${new Date(measurement.measurement_date).toISOString().split('T')[0]}.pdf`
      )
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF')
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this measurement? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('ice_depth_measurements')
        .delete()
        .eq('id', measurementId)

      if (error) throw error

      alert('Measurement deleted successfully')
      router.push('/ice-depth/history')
    } catch (error: any) {
      console.error('Error deleting measurement:', error)
      alert(error.message || 'Failed to delete measurement')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading measurement...</p>
        </div>
      </div>
    )
  }

  if (!measurement || !template) {
    return null
  }

  const measurements = measurement.measurements as Measurement[]
  const measurementPoints = template.measurement_points as MeasurementPoint[]
  const issueCount = getIssueCount(measurements)
  const avgDepth = calculateAverageDepth(measurements)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ice Depth Measurement</h1>
              <p className="text-gray-600 mt-1">
                {new Date(measurement.measurement_date).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Rink Diagram */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{template.name}</h2>
              <RinkDiagram
                svgContent={template.rink_svg}
                measurementPoints={measurementPoints}
                measurements={measurements}
              />
            </div>
          </div>

          {/* Summary & Info */}
          <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Total Points</div>
                  <div className="text-2xl font-bold">{measurementPoints.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Measured</div>
                  <div className="text-2xl font-bold">{measurements.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Average Depth</div>
                  <div className="text-2xl font-bold">{formatDepth(avgDepth)}</div>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-ice-ideal"></div>
                    <span className="text-sm">Ideal</span>
                  </div>
                  <span className="font-semibold">{issueCount.ideal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-ice-warning"></div>
                    <span className="text-sm">Warning</span>
                  </div>
                  <span className="font-semibold">{issueCount.warning}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-ice-critical"></div>
                    <span className="text-sm">Critical</span>
                  </div>
                  <span className="font-semibold">{issueCount.critical}</span>
                </div>
              </div>
            </div>

            {/* Measurement Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Recorded By</div>
                  <div className="font-medium">{userEmail || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Date & Time</div>
                  <div className="font-medium">
                    {new Date(measurement.measurement_date).toLocaleString()}
                  </div>
                </div>
                {measurement.notes && (
                  <div>
                    <div className="text-gray-600 mb-1">Notes</div>
                    <div className="font-medium bg-gray-50 p-3 rounded">
                      {measurement.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Measurements Table */}
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Detailed Measurements</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Point
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Target Depth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actual Depth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Deviation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {measurements.map((m) => {
                    const point = measurementPoints.find(p => p.id === m.pointId)
                    if (!point) return null

                    const deviation = m.value - point.targetDepth

                    return (
                      <tr key={m.pointId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {point.label}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDepth(point.targetDepth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDepth(m.value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deviation > 0 ? '+' : ''}{formatDepth(deviation)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            m.status === 'ideal'
                              ? 'bg-green-100 text-green-800'
                              : m.status === 'warning'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {m.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
