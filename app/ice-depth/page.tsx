'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, History, FileText } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'

type IceDepthTemplate = Database['public']['Tables']['ice_depth_templates']['Row']
type IceDepthMeasurement = Database['public']['Tables']['ice_depth_measurements']['Row']

export default function IceDepthPage() {
  const [templates, setTemplates] = useState<IceDepthTemplate[]>([])
  const [recentMeasurements, setRecentMeasurements] = useState<IceDepthMeasurement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [templatesRes, measurementsRes] = await Promise.all([
        supabase
          .from('ice_depth_templates')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('ice_depth_measurements')
          .select('*')
          .order('measurement_date', { ascending: false })
          .limit(5),
      ])

      if (templatesRes.data) setTemplates(templatesRes.data)
      if (measurementsRes.data) setRecentMeasurements(measurementsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ice Depth Management</h1>
            <p className="text-gray-600 mt-1">Monitor and record ice thickness measurements</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Home
          </Link>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/ice-depth/measure"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">New Measurement</h3>
                <p className="text-sm text-gray-600">Record ice depth</p>
              </div>
            </div>
          </Link>

          <Link
            href="/ice-depth/history"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-full p-3">
                <History className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Measurement History</h3>
                <p className="text-sm text-gray-600">View past records</p>
              </div>
            </div>
          </Link>

          <Link
            href="/ice-depth/templates"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 rounded-full p-3">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Templates</h3>
                <p className="text-sm text-gray-600">Manage rink templates</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Active Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Active Templates</h2>
          {templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No templates available</p>
              <Link
                href="/ice-depth/templates/new"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Template
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {(template.measurement_points as any[]).length} measurement points
                  </p>
                  <Link
                    href={`/ice-depth/measure?template=${template.id}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start Measurement
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Measurements */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recent Measurements</h2>
          {recentMeasurements.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No measurements recorded yet</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points Measured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentMeasurements.map((measurement) => (
                    <tr key={measurement.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(measurement.measurement_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(measurement.measurements as any[]).length} points
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/ice-depth/view/${measurement.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
