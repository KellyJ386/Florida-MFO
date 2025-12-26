'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Edit, Trash2, Download } from 'lucide-react'
import Link from 'next/link'
import type { ReportTab, ReportField } from '@/lib/types/database'
import type { Database } from '@/lib/types/database'

type DailyReport = Database['public']['Tables']['daily_reports']['Row']
type DailyReportTemplate = Database['public']['Tables']['daily_report_templates']['Row']

export default function ViewReportPage() {
  const [report, setReport] = useState<DailyReport | null>(null)
  const [template, setTemplate] = useState<DailyReportTemplate | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)

  const params = useParams()
  const reportId = params.id as string
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchReport()
  }, [reportId])

  const fetchReport = async () => {
    try {
      const { data: reportData, error: reportError } = await supabase
        .from('daily_reports')
        .select('*')
        .eq('id', reportId)
        .single()

      if (reportError) throw reportError
      setReport(reportData)

      // Fetch template
      const { data: templateData, error: templateError } = await supabase
        .from('daily_report_templates')
        .select('*')
        .eq('id', reportData.template_id)
        .single()

      if (templateError) throw templateError
      setTemplate(templateData)

      // Fetch user email
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', reportData.submitted_by)
        .single()

      if (profileData) setUserEmail(profileData.email)
    } catch (error) {
      console.error('Error fetching report:', error)
      alert('Failed to load report')
      router.push('/daily-reports')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('daily_reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error

      alert('Report deleted successfully')
      router.push('/daily-reports')
    } catch (error: any) {
      console.error('Error deleting report:', error)
      alert(error.message || 'Failed to delete report')
    }
  }

  const renderFieldValue = (field: ReportField, value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400 italic">Not provided</span>
    }

    switch (field.type) {
      case 'checkbox':
        return value ? '✓ Yes' : '✗ No'
      case 'textarea':
        return <div className="whitespace-pre-wrap">{value}</div>
      default:
        return value
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    )
  }

  if (!report || !template) {
    return null
  }

  const tabs = template.tabs as ReportTab[]
  const formData = report.data as Record<string, any>
  const photos = report.photos || []

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
              <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
              <p className="text-gray-600 mt-1">
                {new Date(report.report_date).toLocaleDateString()} - {report.shift.charAt(0).toUpperCase() + report.shift.slice(1)} Shift
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/daily-reports/edit/${report.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-5 h-5" />
                Edit
              </Link>
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

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px overflow-x-auto">
                  {tabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(index)}
                      className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                        activeTab === index
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.title}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {tabs[activeTab] && (
                  <div className="space-y-6">
                    {tabs[activeTab].fields.map((field) => {
                      const fieldKey = `${tabs[activeTab].id}_${field.id}`
                      const value = formData[fieldKey]

                      return (
                        <div key={field.id} className="border-b border-gray-100 pb-4 last:border-0">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </div>
                          <div className="text-gray-900">
                            {renderFieldValue(field, value)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Photos */}
            {photos.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Photos ({photos.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <a
                      key={index}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Report Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Report Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Date</div>
                  <div className="font-medium">
                    {new Date(report.report_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Shift</div>
                  <div className="font-medium capitalize">{report.shift}</div>
                </div>
                <div>
                  <div className="text-gray-600">Submitted By</div>
                  <div className="font-medium">{userEmail || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Submitted At</div>
                  <div className="font-medium">
                    {new Date(report.created_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Template</div>
                  <div className="font-medium">{template.name}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
