'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Users, Clock, Home, ArrowRight, Plus, TrendingUp, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [swapRequests, setSwapRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get upcoming schedules (next 7 days)
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [schedulesRes, swapsRes] = await Promise.all([
        supabase
          .from('employee_schedules')
          .select(`
            *,
            employee:profiles!employee_id(full_name, email)
          `)
          .gte('schedule_date', today)
          .lte('schedule_date', nextWeek)
          .order('schedule_date', { ascending: true })
          .limit(10),
        supabase
          .from('shift_swap_requests')
          .select('*')
          .eq('status', 'pending')
          .limit(5),
      ])

      if (schedulesRes.data) setSchedules(schedulesRes.data)
      if (swapsRes.data) setSwapRequests(swapsRes.data)
    } catch (error) {
      console.error('Error fetching schedule data:', error)
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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-seahawks-navy/20 border-t-seahawks-navy
                         dark:border-seahawks-green/20 dark:border-t-seahawks-green"></div>
          <p className="text-seahawks-navy dark:text-seahawks-green font-semibold">Loading Schedule...</p>
        </div>
      </div>
    )
  }

  const actions = [
    {
      title: 'View Calendar',
      description: 'Weekly and monthly schedule views',
      icon: Calendar,
      href: '/schedule/calendar',
      gradient: 'from-seahawks-navy to-seahawks-navy-light',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-seahawks-navy dark:text-blue-400',
    },
    {
      title: 'My Schedule',
      description: 'View your assigned shifts',
      icon: Clock,
      href: '/schedule/my-schedule',
      gradient: 'from-seahawks-green to-seahawks-green-dark',
      iconBg: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-seahawks-green dark:text-seahawks-green-light',
    },
    {
      title: 'Manage Staff',
      description: 'Assign and manage employee schedules',
      icon: Users,
      href: '/schedule/manage',
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-seahawks-navy to-seahawks-navy-light shadow-seahawks">
              <CalendarDays className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-purple-600
                             dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Employee Schedule
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Manage staff scheduling and shift assignments
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

                <div className="flex items-center gap-2 text-seahawks-navy dark:text-seahawks-green font-semibold">
                  <span>Open</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </div>

                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${action.gradient}
                                transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
              </Link>
            )
          })}
        </div>

        {/* Upcoming Schedules */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-seahawks-green" />
            Upcoming Shifts (Next 7 Days)
          </h2>
          {schedules.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                           dark:border-slate-700 p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-6">No shifts scheduled yet</p>
              <Link
                href="/schedule/manage"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-seahawks-navy to-seahawks-navy-light
                           text-white rounded-xl font-semibold shadow-seahawks hover:shadow-seahawks-lg
                           transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Create Schedule
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
                        Employee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Shift
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                          {new Date(schedule.schedule_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {schedule.employee?.full_name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full bg-seahawks-navy/10 dark:bg-seahawks-navy/20
                                         text-seahawks-navy dark:text-blue-400 text-sm font-semibold">
                            {getShiftLabel(schedule.shift_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {schedule.start_time} - {schedule.end_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            schedule.status === 'scheduled'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : schedule.status === 'completed'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                            {schedule.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Shift Swap Requests */}
        {swapRequests.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-seahawks-green" />
              Pending Swap Requests
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {swapRequests.map((request) => (
                <div key={request.id}
                     className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200
                               dark:border-slate-700 p-6 shadow-md hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30
                                   text-yellow-700 dark:text-yellow-400 text-sm font-semibold">
                      Pending Review
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    {request.reason || 'No reason provided'}
                  </p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-seahawks-green hover:bg-seahawks-green-dark
                                     text-white rounded-lg font-semibold transition-all">
                      Approve
                    </button>
                    <button className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300
                                     dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg
                                     font-semibold transition-all">
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
