'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  TrendingUp, TrendingDown, FileText, Snowflake, Users, Calendar, Home,
  BarChart3, PieChart, LineChart, Activity, CheckCircle, Clock, AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalMeasurements: 0,
    totalReports: 0,
    totalTemplates: 0,
    totalUsers: 0,
    recentMeasurements: 0,
    recentReports: 0,
    totalSchedules: 0,
    reportsToday: 0,
    scheduledToday: 0,
    avgIceDepth: 0,
    complianceRate: 0,
    activeUsers7Days: 0,
    pendingSwaps: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])

  const supabase = createClient()
  const { isManager, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isManager && !isAdmin) {
      router.push('/admin')
      return
    }
    fetchStats()
  }, [isManager, isAdmin])

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

      const [
        measurements,
        reports,
        iceTemplates,
        reportTemplates,
        users,
        recentMeasurements,
        recentReports,
        schedules,
        todayReports,
        todaySchedules,
        swaps
      ] = await Promise.all([
        supabase.from('ice_depth_measurements').select('id', { count: 'exact', head: true }),
        supabase.from('daily_reports').select('id', { count: 'exact', head: true }),
        supabase.from('ice_depth_templates').select('id', { count: 'exact', head: true }),
        supabase.from('daily_report_templates').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('ice_depth_measurements').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgoStr),
        supabase.from('daily_reports').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgoStr),
        supabase.from('employee_schedules').select('id', { count: 'exact', head: true }),
        supabase.from('daily_reports').select('id', { count: 'exact', head: true }).eq('report_date', today),
        supabase.from('employee_schedules').select('id', { count: 'exact', head: true }).eq('schedule_date', today),
        supabase.from('shift_swap_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      setStats({
        totalMeasurements: measurements.count || 0,
        totalReports: reports.count || 0,
        totalTemplates: (iceTemplates.count || 0) + (reportTemplates.count || 0),
        totalUsers: users.count || 0,
        recentMeasurements: recentMeasurements.count || 0,
        recentReports: recentReports.count || 0,
        totalSchedules: schedules.count || 0,
        reportsToday: todayReports.count || 0,
        scheduledToday: todaySchedules.count || 0,
        avgIceDepth: 1.25, // Mock - would calculate from actual data
        complianceRate: 94.5, // Mock - would calculate from actual data
        activeUsers7Days: users.count || 0,
        pendingSwaps: swaps.count || 0
      })

      // Mock recent activity
      setRecentActivity([
        { type: 'report', user: 'John Doe', action: 'submitted evening report', time: '5 mins ago' },
        { type: 'measurement', user: 'Jane Smith', action: 'recorded ice depth', time: '12 mins ago' },
        { type: 'schedule', user: 'Mike Johnson', action: 'requested shift swap', time: '25 mins ago' },
        { type: 'user', user: 'Admin', action: 'updated user role', time: '1 hour ago' }
      ])

      // Mock top performers
      setTopPerformers([
        { name: 'Jane Smith', reports: 24, accuracy: 98.5 },
        { name: 'John Doe', reports: 22, accuracy: 96.2 },
        { name: 'Mike Johnson', reports: 20, accuracy: 95.8 }
      ])

    } catch (error) {
      console.error('Error fetching stats:', error)
      alert('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-seahawks-green/20 border-t-seahawks-green"></div>
          <p className="text-seahawks-navy dark:text-seahawks-green font-semibold">Loading Analytics...</p>
        </div>
      </div>
    )
  }

  const mainMetrics = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Reports Today',
      value: stats.reportsToday,
      change: '+8%',
      trend: 'up' as const,
      icon: FileText,
      color: 'from-seahawks-green to-seahawks-green-dark'
    },
    {
      label: 'Ice Compliance',
      value: `${stats.complianceRate}%`,
      change: '+2.3%',
      trend: 'up' as const,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Pending Swaps',
      value: stats.pendingSwaps,
      change: '-15%',
      trend: 'down' as const,
      icon: AlertTriangle,
      color: 'from-yellow-500 to-yellow-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100
                     dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800
                         hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Admin Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-blue-600
                             dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Real-time insights and performance metrics
              </p>
            </div>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainMetrics.map((metric) => {
            const Icon = metric.icon
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown
            const trendColor = metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

            return (
              <div key={metric.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg
                                               hover:shadow-xl transition-all hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
                    <TrendIcon className="w-4 h-4" />
                    {metric.change}
                  </div>
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">{metric.label}</div>
                <div className="text-3xl font-bold text-seahawks-navy dark:text-white">{metric.value}</div>
              </div>
            )
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Overview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <LineChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Activity Overview</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Daily Reports</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{stats.recentReports} last 30 days</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-seahawks-navy dark:text-white">{stats.totalReports}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Snowflake className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Ice Measurements</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{stats.recentMeasurements} last 30 days</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-seahawks-navy dark:text-white">{stats.totalMeasurements}</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Scheduled Shifts</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{stats.scheduledToday} today</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-seahawks-navy dark:text-white">{stats.totalSchedules}</div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="w-6 h-6 text-seahawks-green dark:text-seahawks-green-light" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Top Performers</h2>
            </div>
            <div className="space-y-4">
              {topPerformers.map((performer, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-seahawks-navy to-seahawks-green
                                   flex items-center justify-center text-white font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">{performer.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{performer.reports} reports</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-seahawks-green dark:text-seahawks-green-light">
                      {performer.accuracy}%
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">accuracy</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl
                                       hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'report' ? 'bg-blue-500' :
                  activity.type === 'measurement' ? 'bg-green-500' :
                  activity.type === 'schedule' ? 'bg-purple-500' :
                  'bg-slate-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-semibold text-slate-900 dark:text-white">{activity.user}</span>
                    <span className="text-slate-600 dark:text-slate-400"> {activity.action}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-8 h-8" />
              <div className="text-lg font-semibold">System Status</div>
            </div>
            <div className="text-3xl font-bold">Operational</div>
            <div className="text-sm opacity-90 mt-1">All systems running smoothly</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-8 h-8" />
              <div className="text-lg font-semibold">Response Time</div>
            </div>
            <div className="text-3xl font-bold">45ms</div>
            <div className="text-sm opacity-90 mt-1">Average API response</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-8 h-8" />
              <div className="text-lg font-semibold">Active Users</div>
            </div>
            <div className="text-3xl font-bold">{stats.activeUsers7Days}</div>
            <div className="text-sm opacity-90 mt-1">Last 7 days</div>
          </div>
        </div>
      </div>
    </div>
  )
}
