'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid3x3, List, Home, Plus, User } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

type EmployeeSchedule = Database['public']['Tables']['employee_schedules']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

type ScheduleWithEmployee = EmployeeSchedule & {
  employee: Profile
}

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<ScheduleWithEmployee[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [loading, setLoading] = useState(true)
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWithEmployee | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchSchedules()
  }, [currentDate, viewMode])

  const fetchSchedules = async () => {
    try {
      const startDate = getStartDate()
      const endDate = getEndDate()

      const { data, error } = await supabase
        .from('employee_schedules')
        .select(`
          *,
          employee:profiles!employee_schedules_employee_id_fkey(*)
        `)
        .gte('schedule_date', startDate.toISOString().split('T')[0])
        .lte('schedule_date', endDate.toISOString().split('T')[0])
        .order('schedule_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setSchedules((data as any) || [])
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStartDate = () => {
    const date = new Date(currentDate)
    if (viewMode === 'week') {
      const day = date.getDay()
      date.setDate(date.getDate() - day)
    } else {
      date.setDate(1)
    }
    return date
  }

  const getEndDate = () => {
    const date = new Date(currentDate)
    if (viewMode === 'week') {
      const day = date.getDay()
      date.setDate(date.getDate() + (6 - day))
    } else {
      date.setMonth(date.getMonth() + 1)
      date.setDate(0)
    }
    return date
  }

  const getDaysInView = () => {
    const days = []
    const start = getStartDate()
    const end = getEndDate()
    const current = new Date(start)

    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return schedules.filter(s => s.schedule_date === dateStr)
  }

  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const navigateToday = () => {
    setCurrentDate(new Date())
  }

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300'
      case 'afternoon':
        return 'bg-seahawks-green/10 dark:bg-seahawks-green/20 border-seahawks-green dark:border-seahawks-green-dark text-seahawks-green-dark dark:text-seahawks-green-light'
      case 'evening':
        return 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300'
      default:
        return 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      case 'swap_requested':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
    }
  }

  const formatDate = () => {
    if (viewMode === 'week') {
      const start = getStartDate()
      const end = getEndDate()
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500"></div>
          <p className="text-seahawks-navy dark:text-purple-400 font-semibold">Loading Calendar...</p>
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-purple-600
                             dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
                Schedule Calendar
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                View and manage staff schedules
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={navigatePrevious}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                           hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={navigateToday}
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                           hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-semibold text-sm"
              >
                Today
              </button>
              <button
                onClick={navigateNext}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                           hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="text-xl font-bold text-slate-900 dark:text-white ml-2">
                {formatDate()}
              </div>
            </div>

            {/* View Toggle & Actions */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                    viewMode === 'week'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <List className="w-4 h-4 inline mr-1" />
                  Week
                </button>
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                    viewMode === 'month'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4 inline mr-1" />
                  Month
                </button>
              </div>

              <Link
                href="/schedule/manage"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                           text-white rounded-lg font-semibold shadow-green hover:shadow-green-lg
                           transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add Shift
              </Link>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
          {viewMode === 'week' ? (
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
                  {getDaysInView().map((day, idx) => {
                    const isToday = day.toDateString() === new Date().toDateString()
                    return (
                      <div
                        key={idx}
                        className={`p-4 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0 ${
                          isToday ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-slate-50 dark:bg-slate-900/50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">
                          {day.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-2xl font-bold mt-1 ${
                          isToday ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {day.getDate()}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Schedule Grid */}
                <div className="grid grid-cols-7 min-h-[500px]">
                  {getDaysInView().map((day, idx) => {
                    const daySchedules = getSchedulesForDate(day)
                    const isToday = day.toDateString() === new Date().toDateString()

                    return (
                      <div
                        key={idx}
                        className={`p-3 border-r border-slate-200 dark:border-slate-700 last:border-r-0 space-y-2 ${
                          isToday ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''
                        }`}
                      >
                        {daySchedules.map((schedule) => (
                          <button
                            key={schedule.id}
                            onClick={() => setSelectedSchedule(schedule)}
                            className={`w-full text-left p-2 rounded-lg border-l-4 text-xs hover:shadow-md transition-all ${
                              getShiftColor(schedule.shift_type)
                            }`}
                          >
                            <div className="font-semibold truncate flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {schedule.employee.full_name || 'Unknown'}
                            </div>
                            <div className="text-xs opacity-75 mt-1">
                              {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                            </div>
                            {schedule.position && (
                              <div className="text-xs opacity-75 truncate">{schedule.position}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-slate-600 dark:text-slate-400 py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {getDaysInView().map((day, idx) => {
                  const daySchedules = getSchedulesForDate(day)
                  const isToday = day.toDateString() === new Date().toDateString()
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()

                  return (
                    <div
                      key={idx}
                      className={`min-h-[100px] p-2 rounded-lg border ${
                        isToday
                          ? 'border-purple-600 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                          : isCurrentMonth
                          ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50'
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 opacity-50'
                      }`}
                    >
                      <div className={`text-sm font-semibold mb-1 ${
                        isToday ? 'text-purple-600 dark:text-purple-400' : 'text-slate-900 dark:text-white'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {daySchedules.slice(0, 3).map((schedule) => (
                          <button
                            key={schedule.id}
                            onClick={() => setSelectedSchedule(schedule)}
                            className={`w-full text-left px-1 py-0.5 rounded text-xs truncate ${
                              getShiftColor(schedule.shift_type)
                            }`}
                          >
                            {schedule.employee.full_name?.split(' ')[0] || 'N/A'}
                          </button>
                        ))}
                        {daySchedules.length > 3 && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            +{daySchedules.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Legend</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Shift Types</div>
              <div className="flex flex-wrap gap-2">
                <div className={`px-3 py-1 rounded-lg border ${getShiftColor('morning')}`}>
                  Morning
                </div>
                <div className={`px-3 py-1 rounded-lg border ${getShiftColor('afternoon')}`}>
                  Afternoon
                </div>
                <div className={`px-3 py-1 rounded-lg border ${getShiftColor('evening')}`}>
                  Evening
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Status</div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge('scheduled')}`}>
                  Scheduled
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge('completed')}`}>
                  Completed
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge('swap_requested')}`}>
                  Swap Requested
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSchedule && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSchedule(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Shift Details</h3>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Employee</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedSchedule.employee.full_name || 'Unknown'}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Date</div>
                <div className="text-lg text-slate-900 dark:text-white">
                  {new Date(selectedSchedule.schedule_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Shift Type</div>
                  <span className={`inline-block px-3 py-1 rounded-lg border ${getShiftColor(selectedSchedule.shift_type)}`}>
                    {selectedSchedule.shift_type.charAt(0).toUpperCase() + selectedSchedule.shift_type.slice(1)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Status</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedSchedule.status)}`}>
                    {selectedSchedule.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Time</div>
                <div className="text-lg text-slate-900 dark:text-white">
                  {selectedSchedule.start_time.slice(0, 5)} - {selectedSchedule.end_time.slice(0, 5)}
                </div>
              </div>

              {selectedSchedule.position && (
                <div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Position</div>
                  <div className="text-lg text-slate-900 dark:text-white">{selectedSchedule.position}</div>
                </div>
              )}

              {selectedSchedule.notes && (
                <div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">Notes</div>
                  <div className="text-slate-900 dark:text-white">{selectedSchedule.notes}</div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => router.push(`/schedule/manage?edit=${selectedSchedule.id}`)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                           text-white rounded-lg font-semibold hover:from-seahawks-green-dark hover:to-green-800
                           transition-all"
              >
                Edit Shift
              </button>
              <button
                onClick={() => setSelectedSchedule(null)}
                className="px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
                           rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
