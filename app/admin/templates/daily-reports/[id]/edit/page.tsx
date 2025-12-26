'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { TemplateBuilder } from '@/components/daily-reports/TemplateBuilder'
import type { ReportTab } from '@/lib/types/database'
import type { Database } from '@/lib/types/database'

type DailyReportTemplate = Database['public']['Tables']['daily_report_templates']['Row']

export default function EditReportTemplatePage() {
  const [template, setTemplate] = useState<DailyReportTemplate | null>(null)
  const [name, setName] = useState('')
  const [tabs, setTabs] = useState<ReportTab[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const params = useParams()
  const templateId = params.id as string
  const supabase = createClient()
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchTemplate()
  }, [templateId])

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_report_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) throw error

      setTemplate(data)
      setName(data.name)
      setTabs(data.tabs as ReportTab[])
    } catch (error) {
      console.error('Error fetching template:', error)
      alert('Failed to load template')
      router.push('/admin/templates/daily-reports')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a template name')
      return
    }

    if (tabs.length === 0) {
      alert('Please add at least one tab')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('daily_report_templates')
        .update({
          name: name.trim(),
          tabs: tabs as any,
        })
        .eq('id', templateId)

      if (error) throw error

      alert('Template updated successfully!')
      router.push('/admin/templates/daily-reports')
    } catch (error: any) {
      console.error('Error saving template:', error)
      alert(error.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Report Template</h1>
          <p className="text-gray-600 mt-1">Modify form template configuration</p>
        </div>

        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Template Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Standard Daily Report"
                required
              />
            </div>

            {/* Template Builder */}
            <TemplateBuilder
              tabs={tabs}
              onTabsChange={setTabs}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => router.push('/admin/templates/daily-reports')}
                disabled={saving}
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
