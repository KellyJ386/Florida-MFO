'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Calendar, FileText, Home, ClipboardList, ArrowRight, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-seahawks-green/20 border-t-seahawks-green"></div>
          <p className="text-seahawks-navy dark:text-seahawks-green font-semibold">Loading Daily Reports...</p>
        </div>
      </div>
    )
  }

  const actions = [
    {
      title: 'New Report',
      description: 'Create shift report',
      icon: Plus,
      href: '/daily-reports/new',
      gradient: 'from-seahawks-green to-seahawks-green-dark',
      iconBg: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-seahawks-green dark:text-seahawks-green-light',
    },
    {
      title: 'Calendar View',
      description: 'Browse reports by date',
      icon: Calendar,
      href: '/daily-reports/calendar',
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Templates',
      description: 'Manage report templates',
      icon: FileText,
      href: '/admin/templates/daily-reports',
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100
                     dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800
                         hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-seahawks-green to-seahawks-green-dark shadow-green">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-seahawks-green
                             dark:from-white dark:to-seahawks-green-light bg-clip-text text-transparent">
                Daily Reports
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                End-of-shift reporting and documentation
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards - Large Buttons */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl
                           border border-slate-200 dark:border-slate-700
                           shadow-lg hover:shadow-2xl transition-all duration-300
                           hover:scale-[1.02] active:scale-[0.98] p-8"
              >
                <div className={`${action.iconBg} rounded-2xl p-5 mb-6 w-fit transition-transform
                                group-hover:scale-110 duration-300`}>
                  <Icon className={`w-10 h-10 ${action.iconColor}`} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {action.title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {action.description}
                </p>

                <div className="flex items-center gap-2 text-seahawks-green dark:text-seahawks-green-light font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </div>

                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${action.gradient}
                                transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              </Link>
            )
          })}
        </div>

        {/* Recent Reports */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-seahawks-green" />
            Recent Reports
          </h2>
          {reports.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                           dark:border-slate-700 p-12 text-center">
              <ClipboardList className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-6">No reports submitted yet</p>
              <Link
                href="/daily-reports/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                           text-white rounded-xl font-semibold shadow-green hover:shadow-green-lg
                           transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Create First Report
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                           dark:border-slate-700 overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Shift
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                          {new Date(report.report_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full bg-seahawks-green/10 dark:bg-seahawks-green/20
                                         text-seahawks-green-dark dark:text-seahawks-green-light text-sm font-semibold">
                            {getShiftLabel(report.shift)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {new Date(report.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-3">
                          <Link
                            href={`/daily-reports/view/${report.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400
                                     hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                          >
                            View
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/daily-reports/edit/${report.id}`}
                            className="inline-flex items-center gap-1 text-seahawks-green dark:text-seahawks-green-light
                                     hover:text-seahawks-green-dark dark:hover:text-seahawks-green font-semibold"
                          >
                            Edit
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Active Templates */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-seahawks-green" />
            Report Templates
          </h2>
          {templates.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                           dark:border-slate-700 p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-6">No templates configured</p>
              <Link
                href="/admin/templates/daily-reports"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600
                           text-white rounded-xl font-semibold shadow-lg hover:shadow-xl
                           transition-all hover:scale-105 active:scale-95"
              >
                <Settings className="w-5 h-5" />
                Configure Templates
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id}
                     className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                               dark:border-slate-700 p-6 shadow-md hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                      <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">{template.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {(template.tabs as any[]).length} tabs configured
                  </p>
                  <Link
                    href={`/daily-reports/new?template=${template.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                               text-white rounded-lg font-semibold hover:from-seahawks-green-dark hover:to-green-800
                               transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
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
