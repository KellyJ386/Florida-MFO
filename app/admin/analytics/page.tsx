'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { TrendingUp, FileText, Snowflake, Users, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalMeasurements: 0,
    totalReports: 0,
    totalTemplates: 0,
    totalUsers: 0,
    recentMeasurements: 0,
    recentReports: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const { isManager } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isManager) {
      router.push('/admin')
      return
    }
    fetchStats()
  }, [isManager])

  const fetchStats = async () => {
    try {
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
      ] = await Promise.all([
        supabase.from('ice_depth_measurements').select('id', { count: 'exact', head: true }),
        supabase.from('daily_reports').select('id', { count: 'exact', head: true }),
        supabase.from('ice_depth_templates').select('id', { count: 'exact', head: true }),
        supabase.from('daily_report_templates').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('ice_depth_measurements').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgoStr),
        supabase.from('daily_reports').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgoStr),
      ])

      setStats({
        totalMeasurements: measurements.count || 0,
        totalReports: reports.count || 0,
        totalTemplates: (iceTemplates.count || 0) + (reportTemplates.count || 0),
        totalUsers: users.count || 0,
        recentMeasurements: recentMeasurements.count || 0,
        recentReports: recentReports.count || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      alert('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">System usage and activity statistics</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back
          </button>
        </div>

        {/* Overall Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Snowflake className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Total Measurements</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalMeasurements}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.recentMeasurements} in last 30 days
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-lg p-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Total Reports</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
            <p className="text-sm text-gray-500 mt-2">
              {stats.recentReports} in last 30 days
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Total Templates</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalTemplates}</p>
            <p className="text-sm text-gray-500 mt-2">
              Ice depth & report templates
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 rounded-lg p-3">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-sm text-gray-600 mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-sm text-gray-500 mt-2">
              Active user accounts
            </p>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Snowflake className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Ice Depth Measurements</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.recentMeasurements}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Daily Reports</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {stats.recentReports}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Activity in the last 30 days
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Usage Trends</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Measurement Frequency</span>
                  <span className="font-medium">
                    {stats.totalMeasurements > 0
                      ? ((stats.recentMeasurements / 30) * 7).toFixed(1)
                      : 0}{' '}
                    per week
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((stats.recentMeasurements / 30) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Report Frequency</span>
                  <span className="font-medium">
                    {stats.totalReports > 0
                      ? ((stats.recentReports / 30) * 7).toFixed(1)
                      : 0}{' '}
                    per week
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((stats.recentReports / 30) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">User Engagement</span>
                  <span className="font-medium">Active</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
