'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'

type DailyReport = Database['public']['Tables']['daily_reports']['Row']
type DailyReportTemplate = Database['public']['Tables']['daily_report_templates']['Row']

export default function DailyReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([])
  const [templates, setTemplates] = useState<DailyReportTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [reportsRes, templatesRes] = await Promise.all([
        supabase
          .from('daily_reports')
          .select('*')
          .order('report_date', { ascending: false })
          .limit(10),
        supabase
          .from('daily_report_templates')
          .select('*')
          .order('created_at', { ascending: false }),
      ])

      if (reportsRes.data) setReports(reportsRes.data)
      if (templatesRes.data) setTemplates(templatesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getShiftLabel = (shift: string) => {
    return shift.charAt(0).toUpperCase() + shift.slice(1)
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
            <h1 className="text-3xl font-bold text-gray-900">Daily Reports</h1>
            <p className="text-gray-600 mt-1">End-of-shift reporting and documentation</p>
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
            href="/daily-reports/new"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">New Report</h3>
                <p className="text-sm text-gray-600">Create shift report</p>
              </div>
            </div>
          </Link>

          <Link
            href="/daily-reports/calendar"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-full p-3">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Calendar View</h3>
                <p className="text-sm text-gray-600">Browse by date</p>
              </div>
            </div>
          </Link>

          <Link
            href="/daily-reports/templates"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 rounded-full p-3">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Templates</h3>
                <p className="text-sm text-gray-600">Manage report templates</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Reports */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Reports</h2>
          {reports.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No reports submitted yet</p>
              <Link
                href="/daily-reports/new"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Report
              </Link>
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
                      Shift
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(report.report_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getShiftLabel(report.shift)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/daily-reports/view/${report.id}`}
                          className="text-blue-600 hover:text-blue-800 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/daily-reports/edit/${report.id}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Active Templates */}
        <div>
          <h2 className="text-xl font-bold mb-4">Report Templates</h2>
          {templates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">No templates configured</p>
              <Link
                href="/admin/templates/daily-reports"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Configure Templates
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {(template.tabs as any[]).length} tabs configured
                  </p>
                  <Link
                    href={`/daily-reports/new?template=${template.id}`}
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Use Template
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
