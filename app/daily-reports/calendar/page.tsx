'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'

type DailyReport = Database['public']['Tables']['daily_reports']['Row']

export default function CalendarPage() {
  const [reports, setReports] = useState<DailyReport[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchReports()
  }, [currentDate])

  const fetchReports = async () => {
    try {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const { data, error } = await supabase
        .from('daily_reports')
        .select('*')
        .gte('report_date', startOfMonth.toISOString().split('T')[0])
        .lte('report_date', endOfMonth.toISOString().split('T')[0])

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      alert('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getReportsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return reports.filter(r => r.report_date === dateStr)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const days = getDaysInMonth()
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Calendar</h1>
            <p className="text-gray-600 mt-1">View reports by date</p>
          </div>
          <Link
            href="/daily-reports"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Back
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-24 border border-gray-200 rounded-lg bg-gray-50" />
              }

              const dayReports = getReportsForDate(date)
              const today = isToday(date)

              return (
                <div
                  key={date.toISOString()}
                  className={`h-24 border-2 rounded-lg p-2 ${
                    today
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${
                      today ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </span>
                    {dayReports.length > 0 && (
                      <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {dayReports.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayReports.slice(0, 2).map(report => (
                      <Link
                        key={report.id}
                        href={`/daily-reports/view/${report.id}`}
                        className="block text-xs truncate px-1 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        {report.shift.charAt(0).toUpperCase()}
                      </Link>
                    ))}
                    {dayReports.length > 2 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayReports.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 bg-blue-50 rounded"></div>
                <span className="text-gray-600">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded"></div>
                <span className="text-gray-600">Morning Shift (M)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded"></div>
                <span className="text-gray-600">Afternoon Shift (A)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded"></div>
                <span className="text-gray-600">Evening Shift (E)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
