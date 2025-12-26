'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, Eye, Download } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import type { Measurement } from '@/lib/types/database'
import { getIssueCount } from '@/lib/utils/measurements'

type IceDepthMeasurement = Database['public']['Tables']['ice_depth_measurements']['Row'] & {
  template: { name: string } | null
  profile: { email: string } | null
}

export default function HistoryPage() {
  const [measurements, setMeasurements] = useState<IceDepthMeasurement[]>([])
  const [filteredMeasurements, setFilteredMeasurements] = useState<IceDepthMeasurement[]>([])
  const [templates, setTemplates] = useState<{id: string, name: string}[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [measurements, searchTerm, selectedTemplate, startDate, endDate])

  const fetchData = async () => {
    try {
      const [measurementsRes, templatesRes] = await Promise.all([
        supabase
          .from('ice_depth_measurements')
          .select(`
            *,
            template:ice_depth_templates(name),
            profile:profiles(email)
          `)
          .order('measurement_date', { ascending: false }),
        supabase
          .from('ice_depth_templates')
          .select('id, name')
          .order('name')
      ])

      if (measurementsRes.data) {
        setMeasurements(measurementsRes.data as any)
      }
      if (templatesRes.data) {
        setTemplates(templatesRes.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to load measurements')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...measurements]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.template?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.profile?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Template filter
    if (selectedTemplate) {
      filtered = filtered.filter(m => m.template_id === selectedTemplate)
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(m =>
        new Date(m.measurement_date) >= new Date(startDate)
      )
    }
    if (endDate) {
      filtered = filtered.filter(m =>
        new Date(m.measurement_date) <= new Date(endDate)
      )
    }

    setFilteredMeasurements(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedTemplate('')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters = searchTerm || selectedTemplate || startDate || endDate

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Measurement History</h1>
            <p className="text-gray-600 mt-1">View and analyze past ice depth measurements</p>
          </div>
          <Link
            href="/ice-depth"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search..."
                />
              </div>
            </div>

            {/* Template Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Templates</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              {filteredMeasurements.length} Measurement{filteredMeasurements.length !== 1 ? 's' : ''}
              {hasActiveFilters && ` (filtered from ${measurements.length})`}
            </h2>
          </div>

          {filteredMeasurements.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">
                {hasActiveFilters
                  ? 'No measurements found matching your filters'
                  : 'No measurements recorded yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recorded By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMeasurements.map((measurement) => {
                    const measurements = measurement.measurements as Measurement[]
                    const issueCount = getIssueCount(measurements)

                    return (
                      <tr key={measurement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(measurement.measurement_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {measurement.template?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {measurement.profile?.email || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {measurements.length} points
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            {issueCount.ideal > 0 && (
                              <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                                {issueCount.ideal} ✓
                              </span>
                            )}
                            {issueCount.warning > 0 && (
                              <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                                {issueCount.warning} ⚠
                              </span>
                            )}
                            {issueCount.critical > 0 && (
                              <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">
                                {issueCount.critical} ✕
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/ice-depth/view/${measurement.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
