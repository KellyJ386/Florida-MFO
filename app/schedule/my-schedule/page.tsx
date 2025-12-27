'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, MapPin, FileText, Home, AlertCircle, CheckCircle, RefreshCw, User } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

type EmployeeSchedule = Database['public']['Tables']['employee_schedules']['Row']

export default function MySchedulePage() {
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([])
  const [upcomingSchedules, setUpcomingSchedules] = useState<EmployeeSchedule[]>([])
  const [pastSchedules, setPastSchedules] = useState<EmployeeSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchUserAndSchedules()
  }, [])

  const fetchUserAndSchedules = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUserId(user.id)

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUserName(profile.full_name || 'Employee')
      }

      // Get all schedules for this employee
      const { data, error } = await supabase
        .from('employee_schedules')
        .select('*')
        .eq('employee_id', user.id)
        .order('schedule_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error

      const today = new Date().toISOString().split('T')[0]
      const upcoming = (data || []).filter(s => s.schedule_date >= today)
      const past = (data || []).filter(s => s.schedule_date < today).reverse()

      setSchedules(data || [])
      setUpcomingSchedules(upcoming)
      setPastSchedules(past)
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning':
        return 'from-blue-500 to-blue-600'
      case 'afternoon':
        return 'from-seahawks-green to-seahawks-green-dark'
      case 'evening':
        return 'from-purple-600 to-purple-800'
      default:
        return 'from-slate-500 to-slate-600'
    }
  }

  const getShiftIcon = (shift: string) => {
    switch (shift) {
      case 'morning':
        return '🌅'
      case 'afternoon':
        return '☀️'
      case 'evening':
        return '🌙'
      default:
        return '⏰'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return {
          icon: Clock,
          color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
          label: 'Scheduled'
        }
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
          label: 'Completed'
        }
      case 'cancelled':
        return {
          icon: AlertCircle,
          color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
          label: 'Cancelled'
        }
      case 'swap_requested':
        return {
          icon: RefreshCw,
          color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
          label: 'Swap Requested'
        }
      default:
        return {
          icon: Clock,
          color: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300',
          label: 'Unknown'
        }
    }
  }

  const calculateTotalHours = (schedules: EmployeeSchedule[]) => {
    return schedules.reduce((total, schedule) => {
      const start = new Date(`1970-01-01T${schedule.start_time}`)
      const end = new Date(`1970-01-01T${schedule.end_time}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + hours
    }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500"></div>
          <p className="text-seahawks-navy dark:text-purple-400 font-semibold">Loading Your Schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100
                     dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/schedule"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800
                         hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Schedule Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-purple-600
                             dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
                My Schedule
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Welcome back, {userName}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Upcoming Shifts</div>
              </div>
              <div className="text-3xl font-bold text-seahawks-navy dark:text-white">
                {upcomingSchedules.length}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-seahawks-green/10 dark:bg-seahawks-green/20">
                  <Clock className="w-5 h-5 text-seahawks-green dark:text-seahawks-green-light" />
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Hours This Week</div>
              </div>
              <div className="text-3xl font-bold text-seahawks-navy dark:text-white">
                {calculateTotalHours(upcomingSchedules.slice(0, 7)).toFixed(1)}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Completed Shifts</div>
              </div>
              <div className="text-3xl font-bold text-seahawks-navy dark:text-white">
                {pastSchedules.filter(s => s.status === 'completed').length}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Shifts */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-seahawks-green" />
              Upcoming Shifts
            </h2>
            <Link
              href="/schedule/swap-requests"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30
                         text-purple-700 dark:text-purple-300 rounded-lg font-semibold hover:bg-purple-200
                         dark:hover:bg-purple-900/50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Request Swap
            </Link>
          </div>

          {upcomingSchedules.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No upcoming shifts scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSchedules.map((schedule) => {
                const status = getStatusBadge(schedule.status)
                const StatusIcon = status.icon

                return (
                  <div
                    key={schedule.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                               p-6 shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Date Box */}
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${getShiftColor(schedule.shift_type)} text-white shadow-lg`}>
                          <div className="text-3xl font-bold leading-none">
                            {new Date(schedule.schedule_date).getDate()}
                          </div>
                          <div className="text-sm font-semibold opacity-90">
                            {new Date(schedule.schedule_date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>

                        {/* Shift Details */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getShiftIcon(schedule.shift_type)}</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                              {schedule.shift_type.charAt(0).toUpperCase() + schedule.shift_type.slice(1)} Shift
                            </h3>
                          </div>

                          <div className="grid md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Calendar className="w-4 h-4" />
                              {new Date(schedule.schedule_date).toLocaleDateString('en-US', { weekday: 'long' })}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Clock className="w-4 h-4" />
                              {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                            </div>
                            {schedule.position && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <MapPin className="w-4 h-4" />
                                {schedule.position}
                              </div>
                            )}
                          </div>

                          {schedule.notes && (
                            <div className="mt-3 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                              <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{schedule.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${status.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Past Shifts */}
        {pastSchedules.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-seahawks-green" />
              Past Shifts
            </h2>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                           overflow-hidden shadow-md">
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
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {pastSchedules.slice(0, 10).map((schedule) => {
                      const status = getStatusBadge(schedule.status)
                      const StatusIcon = status.icon

                      return (
                        <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                            {new Date(schedule.schedule_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 dark:text-white">
                              <span>{getShiftIcon(schedule.shift_type)}</span>
                              {schedule.shift_type.charAt(0).toUpperCase() + schedule.shift_type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                            {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                            {schedule.position || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Link
            href="/schedule/calendar"
            className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                       p-8 shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">View Full Calendar</h3>
                <p className="text-slate-600 dark:text-slate-400">See everyone's schedule</p>
              </div>
            </div>
          </Link>

          <Link
            href="/schedule/availability"
            className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                       p-8 shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-seahawks-green/10 dark:bg-seahawks-green/20">
                <CheckCircle className="w-8 h-8 text-seahawks-green dark:text-seahawks-green-light" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Update Availability</h3>
                <p className="text-slate-600 dark:text-slate-400">Set your availability preferences</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
