'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Home, CheckCircle, XCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

type EmployeeAvailability = Database['public']['Tables']['employee_availability']['Row']

interface AvailabilityGrid {
  [key: number]: {
    morning: boolean
    afternoon: boolean
    evening: boolean
  }
}

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<AvailabilityGrid>({
    0: { morning: true, afternoon: true, evening: true }, // Sunday
    1: { morning: true, afternoon: true, evening: true }, // Monday
    2: { morning: true, afternoon: true, evening: true }, // Tuesday
    3: { morning: true, afternoon: true, evening: true }, // Wednesday
    4: { morning: true, afternoon: true, evening: true }, // Thursday
    5: { morning: true, afternoon: true, evening: true }, // Friday
    6: { morning: true, afternoon: true, evening: true }, // Saturday
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')

  const supabase = createClient()
  const router = useRouter()

  const daysOfWeek = [
    { id: 0, name: 'Sunday', short: 'Sun' },
    { id: 1, name: 'Monday', short: 'Mon' },
    { id: 2, name: 'Tuesday', short: 'Tue' },
    { id: 3, name: 'Wednesday', short: 'Wed' },
    { id: 4, name: 'Thursday', short: 'Thu' },
    { id: 5, name: 'Friday', short: 'Fri' },
    { id: 6, name: 'Saturday', short: 'Sat' },
  ]

  const shiftTypes: Array<'morning' | 'afternoon' | 'evening'> = ['morning', 'afternoon', 'evening']

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
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

      // Fetch existing availability
      const { data, error } = await supabase
        .from('employee_availability')
        .select('*')
        .eq('employee_id', user.id)

      if (error) throw error

      // Update grid with existing availability
      if (data && data.length > 0) {
        const newGrid: AvailabilityGrid = { ...availability }
        data.forEach((item: EmployeeAvailability) => {
          if (!newGrid[item.day_of_week]) {
            newGrid[item.day_of_week] = { morning: false, afternoon: false, evening: false }
          }
          newGrid[item.day_of_week][item.shift_type] = item.is_available
        })
        setAvailability(newGrid)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = (dayId: number, shift: 'morning' | 'afternoon' | 'evening') => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [shift]: !prev[dayId][shift]
      }
    }))
  }

  const handleSave = async () => {
    if (!userId) return

    setSaving(true)
    try {
      // Delete all existing availability for this user
      await supabase
        .from('employee_availability')
        .delete()
        .eq('employee_id', userId)

      // Insert new availability records
      const records = []
      for (const dayId in availability) {
        for (const shift of shiftTypes) {
          records.push({
            employee_id: userId,
            day_of_week: parseInt(dayId),
            shift_type: shift,
            is_available: availability[parseInt(dayId)][shift]
          })
        }
      }

      const { error } = await supabase
        .from('employee_availability')
        .insert(records)

      if (error) throw error

      alert('Availability saved successfully!')
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('Failed to save availability. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const setAllAvailable = () => {
    const newGrid: AvailabilityGrid = {}
    daysOfWeek.forEach(day => {
      newGrid[day.id] = { morning: true, afternoon: true, evening: true }
    })
    setAvailability(newGrid)
  }

  const setAllUnavailable = () => {
    const newGrid: AvailabilityGrid = {}
    daysOfWeek.forEach(day => {
      newGrid[day.id] = { morning: false, afternoon: false, evening: false }
    })
    setAvailability(newGrid)
  }

  const setWeekdaysOnly = () => {
    const newGrid: AvailabilityGrid = {}
    daysOfWeek.forEach(day => {
      const isWeekday = day.id >= 1 && day.id <= 5
      newGrid[day.id] = {
        morning: isWeekday,
        afternoon: isWeekday,
        evening: isWeekday
      }
    })
    setAvailability(newGrid)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500"></div>
          <p className="text-seahawks-navy dark:text-purple-400 font-semibold">Loading Availability...</p>
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
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-purple-600
                             dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
                Availability Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Set your weekly availability, {userName}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={setAllAvailable}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30
                         text-green-700 dark:text-green-300 rounded-lg font-semibold
                         hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              All Available
            </button>
            <button
              onClick={setAllUnavailable}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30
                         text-red-700 dark:text-red-300 rounded-lg font-semibold
                         hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
            >
              <XCircle className="w-4 h-4" />
              All Unavailable
            </button>
            <button
              onClick={setWeekdaysOnly}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30
                         text-blue-700 dark:text-blue-300 rounded-lg font-semibold
                         hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all"
            >
              <Calendar className="w-4 h-4" />
              Weekdays Only
            </button>
          </div>
        </div>

        {/* Availability Grid */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                       overflow-hidden shadow-lg mb-8">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="p-4 font-bold text-slate-900 dark:text-white">Day</div>
                <div className="p-4 text-center">
                  <div className="text-2xl mb-1">{getShiftIcon('morning')}</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Morning</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">6AM - 2PM</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-2xl mb-1">{getShiftIcon('afternoon')}</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Afternoon</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">2PM - 10PM</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-2xl mb-1">{getShiftIcon('evening')}</div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-white">Evening</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">10PM - 6AM</div>
                </div>
              </div>

              {/* Day Rows */}
              {daysOfWeek.map((day) => (
                <div
                  key={day.id}
                  className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0
                             hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="p-4 flex items-center">
                    <div className="font-bold text-lg text-slate-900 dark:text-white">
                      {day.name}
                    </div>
                  </div>

                  {shiftTypes.map((shift) => (
                    <div key={shift} className="p-4 flex items-center justify-center">
                      <button
                        onClick={() => toggleAvailability(day.id, shift)}
                        className={`relative w-20 h-20 rounded-2xl border-2 transition-all duration-300 hover:scale-110 ${
                          availability[day.id][shift]
                            ? `bg-gradient-to-br ${getShiftColor(shift)} border-transparent shadow-lg`
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {availability[day.id][shift] ? (
                          <CheckCircle className="w-10 h-10 text-white mx-auto" />
                        ) : (
                          <XCircle className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800
                       rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-300 mb-2">How it works</h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Click on any time slot to toggle your availability</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Green = Available, Gray = Unavailable</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Use quick actions above to set multiple days at once</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Don't forget to save your changes when you're done!</span>
            </li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                       text-white rounded-2xl font-bold text-xl shadow-green hover:shadow-green-lg
                       transition-all duration-300 hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save className="w-6 h-6" />
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Total Available Shifts</div>
            <div className="text-3xl font-bold text-seahawks-navy dark:text-white">
              {Object.values(availability).reduce((total, day) => {
                return total + Object.values(day).filter(Boolean).length
              }, 0)}
              <span className="text-lg text-slate-400 dark:text-slate-500"> / 21</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Available Days</div>
            <div className="text-3xl font-bold text-seahawks-navy dark:text-white">
              {Object.values(availability).filter(day =>
                day.morning || day.afternoon || day.evening
              ).length}
              <span className="text-lg text-slate-400 dark:text-slate-500"> / 7</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Availability Rate</div>
            <div className="text-3xl font-bold text-seahawks-navy dark:text-white">
              {Math.round(
                (Object.values(availability).reduce((total, day) => {
                  return total + Object.values(day).filter(Boolean).length
                }, 0) / 21) * 100
              )}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
