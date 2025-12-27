'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, History, FileText, Home, Snowflake, ArrowRight, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

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
          .order('measurement_date', { ascending: false})
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/20 border-t-blue-500"></div>
          <p className="text-seahawks-navy dark:text-blue-400 font-semibold">Loading Ice Depth Data...</p>
        </div>
      </div>
    )
  }

  const actions = [
    {
      title: 'New Measurement',
      description: 'Record ice depth readings',
      icon: Plus,
      href: '/ice-depth/measure',
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Measurement History',
      description: 'View past measurements',
      icon: History,
      href: '/ice-depth/history',
      gradient: 'from-seahawks-green to-seahawks-green-dark',
      iconBg: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-seahawks-green dark:text-seahawks-green-light',
    },
    {
      title: 'Manage Templates',
      description: 'Configure rink diagrams',
      icon: FileText,
      href: '/ice-depth/templates',
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Snowflake className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-blue-600
                             dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Ice Depth Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Monitor and record ice thickness with precision
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

                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </div>

                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${action.gradient}
                                transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              </Link>
            )
          })}
        </div>

        {/* Active Templates */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-seahawks-green" />
            Active Templates
          </h2>
          {templates.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                           dark:border-slate-700 p-12 text-center">
              <Snowflake className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-6">No templates available</p>
              <Link
                href="/ice-depth/templates/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600
                           text-white rounded-xl font-semibold shadow-lg hover:shadow-xl
                           transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Create First Template
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id}
                     className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                               dark:border-slate-700 p-6 shadow-md hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                      <Snowflake className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">{template.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {(template.measurement_points as any[]).length} measurement points
                  </p>
                  <Link
                    href={`/ice-depth/measure?template=${template.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600
                               text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700
                               transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Start Measurement
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Measurements */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-seahawks-green" />
            Recent Measurements
          </h2>
          {recentMeasurements.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                           dark:border-slate-700 p-12 text-center">
              <History className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No measurements recorded yet</p>
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
                        Points Measured
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {recentMeasurements.map((measurement) => (
                      <tr key={measurement.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                          {new Date(measurement.measurement_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {(measurement.measurements as any[]).length} points
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/ice-depth/view/${measurement.id}`}
                            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400
                                     hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                          >
                            View Details
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
      </div>
    </div>
  )
}
