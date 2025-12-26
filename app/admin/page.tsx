'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { Settings, FileText, Snowflake, Users, BarChart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!profile || (profile.role !== 'admin' && profile.role !== 'manager'))) {
      router.push('/')
    }
  }, [profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
            <p className="text-gray-600 mt-1">Manage system settings and templates</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back to Home
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Ice Depth Templates */}
          <Link
            href="/admin/templates/ice-depth"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Snowflake className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold">Ice Depth Templates</h2>
            </div>
            <p className="text-gray-600">
              Create and manage rink diagrams and measurement point templates
            </p>
          </Link>

          {/* Daily Report Templates */}
          <Link
            href="/admin/templates/daily-reports"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Report Templates</h2>
            </div>
            <p className="text-gray-600">
              Configure daily report forms, tabs, and field types
            </p>
          </Link>

          {/* User Management */}
          {profile.role === 'admin' && (
            <Link
              href="/admin/users"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-100 rounded-full p-3">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold">User Management</h2>
              </div>
              <p className="text-gray-600">
                Manage user accounts, roles, and permissions
              </p>
            </Link>
          )}

          {/* Analytics */}
          <Link
            href="/admin/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-100 rounded-full p-3">
                <BarChart className="w-6 h-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold">Analytics</h2>
            </div>
            <p className="text-gray-600">
              View system usage statistics and reporting trends
            </p>
          </Link>

          {/* System Settings */}
          {profile.role === 'admin' && (
            <Link
              href="/admin/settings"
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-gray-100 rounded-full p-3">
                  <Settings className="w-6 h-6 text-gray-600" />
                </div>
                <h2 className="text-xl font-semibold">System Settings</h2>
              </div>
              <p className="text-gray-600">
                Configure application settings and preferences
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
