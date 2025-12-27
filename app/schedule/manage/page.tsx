'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, Save, Trash2, Home, Users, Calendar, Clock, MapPin, FileText, X } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

type EmployeeSchedule = Database['public']['Tables']['employee_schedules']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export default function ManageSchedulePage() {
  const [employees, setEmployees] = useState<Profile[]>([])
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<EmployeeSchedule | null>(null)

  const [formData, setFormData] = useState({
    employee_id: '',
    schedule_date: '',
    shift_type: 'morning' as 'morning' | 'afternoon' | 'evening',
    start_time: '08:00',
    end_time: '16:00',
    position: '',
    notes: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'swap_requested'
  })

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchData()
    checkEditMode()
  }, [])

  const checkEditMode = async () => {
    const editId = searchParams.get('edit')
    if (editId) {
      const { data } = await supabase
        .from('employee_schedules')
        .select('*')
        .eq('id', editId)
        .single()

      if (data) {
        setEditingSchedule(data)
        setFormData({
          employee_id: data.employee_id,
          schedule_date: data.schedule_date,
          shift_type: data.shift_type,
          start_time: data.start_time.slice(0, 5),
          end_time: data.end_time.slice(0, 5),
          position: data.position || '',
          notes: data.notes || '',
          status: data.status
        })
        setShowForm(true)
      }
    }
  }

  const fetchData = async () => {
    try {
      // Get current user and check permissions
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile && !['admin', 'manager'].includes(profile.role)) {
        alert('You do not have permission to manage schedules')
        router.push('/schedule')
        return
      }

      setCurrentUser(profile)

      // Fetch all employees
      const { data: employeeData } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

      setEmployees(employeeData || [])

      // Fetch upcoming schedules
      const today = new Date().toISOString().split('T')[0]
      const { data: scheduleData } = await supabase
        .from('employee_schedules')
        .select('*')
        .gte('schedule_date', today)
        .order('schedule_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(20)

      setSchedules(scheduleData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const scheduleData = {
        ...formData,
        created_by: currentUser?.id
      }

      if (editingSchedule) {
        // Update existing schedule
        const { error } = await supabase
          .from('employee_schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id)

        if (error) throw error
        alert('Schedule updated successfully!')
      } else {
        // Create new schedule
        const { error } = await supabase
          .from('employee_schedules')
          .insert([scheduleData])

        if (error) throw error
        alert('Schedule created successfully!')
      }

      // Reset form
      setShowForm(false)
      setEditingSchedule(null)
      setFormData({
        employee_id: '',
        schedule_date: '',
        shift_type: 'morning',
        start_time: '08:00',
        end_time: '16:00',
        position: '',
        notes: '',
        status: 'scheduled'
      })

      // Refresh data
      fetchData()
    } catch (error) {
      console.error('Error saving schedule:', error)
      alert('Failed to save schedule. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('employee_schedules')
        .delete()
        .eq('id', scheduleId)

      if (error) throw error

      alert('Schedule deleted successfully!')
      fetchData()
    } catch (error) {
      console.error('Error deleting schedule:', error)
      alert('Failed to delete schedule. Please try again.')
    }
  }

  const getShiftPresetTimes = (shift: 'morning' | 'afternoon' | 'evening') => {
    switch (shift) {
      case 'morning':
        return { start_time: '06:00', end_time: '14:00' }
      case 'afternoon':
        return { start_time: '14:00', end_time: '22:00' }
      case 'evening':
        return { start_time: '22:00', end_time: '06:00' }
    }
  }

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    return employee?.full_name || 'Unknown Employee'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-seahawks-green/20 border-t-seahawks-green"></div>
          <p className="text-seahawks-navy dark:text-seahawks-green font-semibold">Loading Management Panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-seahawks-green to-seahawks-green-dark shadow-green">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-seahawks-green
                               dark:from-white dark:to-seahawks-green-light bg-clip-text text-transparent">
                  Manage Schedules
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                  Assign and manage staff shifts
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowForm(true)
                setEditingSchedule(null)
                setFormData({
                  employee_id: '',
                  schedule_date: '',
                  shift_type: 'morning',
                  start_time: '08:00',
                  end_time: '16:00',
                  position: '',
                  notes: '',
                  status: 'scheduled'
                })
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                         text-white rounded-xl font-semibold shadow-green hover:shadow-green-lg
                         transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Create Schedule
            </button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full my-8">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingSchedule(null)
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Employee Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Employee *
                  </label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                               transition-all"
                    required
                  >
                    <option value="">Select employee...</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name || employee.email} ({employee.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date and Shift Type */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.schedule_date}
                      onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                 rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                                 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Shift Type *
                    </label>
                    <select
                      value={formData.shift_type}
                      onChange={(e) => {
                        const shiftType = e.target.value as 'morning' | 'afternoon' | 'evening'
                        const times = getShiftPresetTimes(shiftType)
                        setFormData({ ...formData, shift_type: shiftType, ...times })
                      }}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                 rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                                 transition-all"
                      required
                    >
                      <option value="morning">Morning (6AM - 2PM)</option>
                      <option value="afternoon">Afternoon (2PM - 10PM)</option>
                      <option value="evening">Evening (10PM - 6AM)</option>
                    </select>
                  </div>
                </div>

                {/* Time Range */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                 rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                                 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                 rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                                 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Position
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                               transition-all"
                    placeholder="e.g., Front Desk, Rink Manager, Maintenance"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                               transition-all"
                    placeholder="Any additional information..."
                  />
                </div>

                {/* Status (for editing) */}
                {editingSchedule && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                                 bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                                 rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                                 transition-all"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-lg
                               bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                               hover:from-seahawks-green-dark hover:to-green-800
                               text-white shadow-green hover:shadow-green-lg
                               transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? 'Saving...' : editingSchedule ? 'Update Schedule' : 'Create Schedule'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingSchedule(null)
                    }}
                    className="px-6 py-3 rounded-xl font-semibold
                               bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
                               hover:bg-slate-200 dark:hover:bg-slate-600
                               transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedules List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Upcoming Schedules</h2>

          {schedules.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-6">No schedules created yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                           text-white rounded-xl font-semibold shadow-green hover:shadow-green-lg
                           transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Create First Schedule
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                           overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Employee
                      </th>
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                          {getEmployeeName(schedule.employee_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {new Date(schedule.schedule_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
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
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            {schedule.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                          <button
                            onClick={() => {
                              setEditingSchedule(schedule)
                              setFormData({
                                employee_id: schedule.employee_id,
                                schedule_date: schedule.schedule_date,
                                shift_type: schedule.shift_type,
                                start_time: schedule.start_time.slice(0, 5),
                                end_time: schedule.end_time.slice(0, 5),
                                position: schedule.position || '',
                                notes: schedule.notes || '',
                                status: schedule.status
                              })
                              setShowForm(true)
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold"
                          >
                            Delete
                          </button>
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
