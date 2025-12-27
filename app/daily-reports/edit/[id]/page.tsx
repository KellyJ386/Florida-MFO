'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import type { ReportTab, ReportField } from '@/lib/types/database'
import type { Database } from '@/lib/types/database'

type DailyReport = Database['public']['Tables']['daily_reports']['Row']
type DailyReportTemplate = Database['public']['Tables']['daily_report_templates']['Row']

export default function EditReportPage() {
  const [report, setReport] = useState<DailyReport | null>(null)
  const [template, setTemplate] = useState<DailyReportTemplate | null>(null)
  const [tabs, setTabs] = useState<ReportTab[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [reportDate, setReportDate] = useState('')
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const params = useParams()
  const reportId = params.id as string
  const supabase = createClient()
  const { user } = useAuth()
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
      setFormData(reportData.data as Record<string, any>)
      setReportDate(reportData.report_date)
      setShift(reportData.shift)

      // Fetch template
      const { data: templateData, error: templateError } = await supabase
        .from('daily_report_templates')
        .select('*')
        .eq('id', reportData.template_id)
        .single()

      if (templateError) throw templateError

      setTemplate(templateData)
      setTabs(templateData.tabs as ReportTab[])
    } catch (error) {
      console.error('Error fetching report:', error)
      alert('Failed to load report')
      router.push('/daily-reports')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (tabId: string, fieldId: string, value: any) => {
    setFormData({
      ...formData,
      [`${tabId}_${fieldId}`]: value,
    })
  }

  const handleSubmit = async () => {
    if (!user || !report) return

    setSaving(true)
    try {
      // Update report
      const { error } = await supabase
        .from('daily_reports')
        .update({
          report_date: reportDate,
          shift,
          data: formData,
        })
        .eq('id', reportId)

      if (error) throw error

      alert('Report updated successfully!')
      router.push(`/daily-reports/view/${reportId}`)
    } catch (error: any) {
      console.error('Error saving report:', error)
      alert(error.message || 'Failed to save report')
    } finally {
      setSaving(false)
    }
  }

  const renderField = (tabId: string, field: ReportField) => {
    const fieldKey = `${tabId}_${field.id}`
    const value = formData[fieldKey] || ''

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        )

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => handleFieldChange(tabId, field.id, e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        )

      default:
        return null
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

  if (!report || !template || tabs.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Daily Report</h1>
          <p className="text-gray-600 mt-1">{template.name}</p>
        </div>

        {/* Report Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Date
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shift
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          {/* Tab Headers */}
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
                {tabs[activeTab].fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderField(tabs[activeTab].id, field)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => router.push(`/daily-reports/view/${reportId}`)}
            disabled={saving}
            className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
