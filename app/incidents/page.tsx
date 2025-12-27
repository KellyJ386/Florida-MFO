'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, Plus, Calendar, Filter, Home, Eye, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

type Incident = Database['public']['Tables']['incidents']['Row']

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchIncidents()
  }, [filterSeverity])

  const fetchIncidents = async () => {
    try {
      let query = supabase
        .from('incidents')
        .select('*')
        .order('incident_date', { ascending: false })
        .order('incident_time', { ascending: false })
        .limit(50)

      if (filterSeverity !== 'all') {
        query = query.eq('severity', filterSeverity)
      }

      const { data, error } = await query

      if (error) throw error
      setIncidents(data || [])
    } catch (error) {
      console.error('Error fetching incidents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700'
      case 'serious':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700'
      case 'moderate':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
      case 'minor':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'submitted':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'draft':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
    }
  }

  const isLocked = (incident: Incident) => {
    return incident.locked_at !== null
  }

  const getTimeRemaining = (incident: Incident) => {
    if (incident.locked_at) return null

    const reportedAt = new Date(incident.reported_at)
    const lockTime = new Date(reportedAt.getTime() + 30 * 60 * 1000) // 30 minutes
    const now = new Date()
    const remaining = lockTime.getTime() - now.getTime()

    if (remaining <= 0) return null

    const minutes = Math.floor(remaining / 60000)
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-seahawks-green/20 border-t-seahawks-green"></div>
          <p className="text-seahawks-navy dark:text-seahawks-green font-semibold">Loading Incidents...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: incidents.length,
    critical: incidents.filter(i => i.severity === 'critical').length,
    serious: incidents.filter(i => i.severity === 'serious').length,
    moderate: incidents.filter(i => i.severity === 'moderate').length,
    minor: incidents.filter(i => i.severity === 'minor').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-red-600
                             dark:from-white dark:to-red-400 bg-clip-text text-transparent">
                Incident & Accident Reports
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Safety incident documentation and tracking
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-md">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Incidents</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-800 shadow-md">
            <div className="text-sm text-red-700 dark:text-red-300 mb-1">Critical</div>
            <div className="text-3xl font-bold text-red-900 dark:text-red-200">{stats.critical}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-800 shadow-md">
            <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Serious</div>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-200">{stats.serious}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 shadow-md">
            <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Moderate</div>
            <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-200">{stats.moderate}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl p-4 border border-blue-200 dark:border-blue-800 shadow-md">
            <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Minor</div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-200">{stats.minor}</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link
            href="/incidents/new"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600
                       text-white rounded-xl font-semibold shadow-lg shadow-red-500/30
                       hover:shadow-xl hover:shadow-red-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Report New Incident
          </Link>

          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="serious">Serious</option>
              <option value="moderate">Moderate</option>
              <option value="minor">Minor</option>
            </select>
          </div>
        </div>

        {/* Incidents List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          {incidents.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                {filterSeverity === 'all' ? 'No incidents reported yet' : `No ${filterSeverity} incidents found`}
              </p>
              <Link
                href="/incidents/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600
                           text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Report First Incident
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Date/Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Injured Party
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Incident Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {incidents.map((incident) => {
                    const timeRemaining = getTimeRemaining(incident)
                    const locked = isLocked(incident)

                    return (
                      <tr key={incident.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {new Date(incident.incident_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {incident.incident_time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {incident.injured_name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            Age {incident.injured_age}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 dark:text-white max-w-xs truncate">
                            {incident.incident_type}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 dark:text-white">
                            {incident.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(incident.severity)}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}>
                              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                            </span>
                            {!locked && timeRemaining && (
                              <span className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                <Clock className="w-3 h-3" />
                                Edit: {timeRemaining}
                              </span>
                            )}
                            {locked && (
                              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                🔒 Locked
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Link
                              href={`/incidents/view/${incident.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30
                                       text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50
                                       font-semibold transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </Link>
                            {!locked && (
                              <Link
                                href={`/incidents/edit/${incident.id}`}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-seahawks-green/10 dark:bg-seahawks-green/20
                                         text-seahawks-green-dark dark:text-seahawks-green-light rounded-lg
                                         hover:bg-seahawks-green/20 dark:hover:bg-seahawks-green/30 font-semibold transition-colors"
                              >
                                Edit
                              </Link>
                            )}
                          </div>
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
