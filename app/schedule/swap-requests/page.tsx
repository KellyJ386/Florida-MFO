'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RefreshCw, Home, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

type ShiftSwapRequest = Database['public']['Tables']['shift_swap_requests']['Row']
type EmployeeSchedule = Database['public']['Tables']['employee_schedules']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

type SwapRequestWithDetails = ShiftSwapRequest & {
  original_schedule: EmployeeSchedule & {
    employee: Profile
  }
  requester: Profile
  swap_target?: Profile | null
  approver?: Profile | null
}

export default function SwapRequestsPage() {
  const [swapRequests, setSwapRequests] = useState<SwapRequestWithDetails[]>([])
  const [mySchedules, setMySchedules] = useState<EmployeeSchedule[]>([])
  const [employees, setEmployees] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [selectedSchedule, setSelectedSchedule] = useState<string>('')
  const [swapWithEmployee, setSwapWithEmployee] = useState<string>('')
  const [swapReason, setSwapReason] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setCurrentUser(profile)

      // Fetch all employees
      const { data: employeeData } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

      setEmployees(employeeData || [])

      // Fetch swap requests
      const { data: swapData } = await supabase
        .from('shift_swap_requests')
        .select(`
          *,
          original_schedule:employee_schedules!shift_swap_requests_original_schedule_id_fkey(
            *,
            employee:profiles!employee_schedules_employee_id_fkey(*)
          ),
          requester:profiles!shift_swap_requests_requested_by_fkey(*),
          swap_target:profiles!shift_swap_requests_swap_with_fkey(*),
          approver:profiles!shift_swap_requests_approved_by_fkey(*)
        `)
        .order('created_at', { ascending: false })

      // Filter based on user role
      let filteredSwaps = swapData || []
      if (profile && !['admin', 'manager'].includes(profile.role)) {
        // Regular employees only see their own requests or requests involving them
        filteredSwaps = filteredSwaps.filter((swap: any) =>
          swap.requested_by === user.id ||
          swap.swap_with === user.id ||
          swap.original_schedule?.employee_id === user.id
        )
      }

      setSwapRequests(filteredSwaps as any)

      // Fetch user's upcoming schedules for swap requests
      const today = new Date().toISOString().split('T')[0]
      const { data: scheduleData } = await supabase
        .from('employee_schedules')
        .select('*')
        .eq('employee_id', user.id)
        .eq('status', 'scheduled')
        .gte('schedule_date', today)
        .order('schedule_date', { ascending: true })

      setMySchedules(scheduleData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .insert([{
          original_schedule_id: selectedSchedule,
          requested_by: currentUser.id,
          swap_with: swapWithEmployee || null,
          reason: swapReason,
          status: 'pending'
        }])

      if (error) throw error

      // Update schedule status
      await supabase
        .from('employee_schedules')
        .update({ status: 'swap_requested' })
        .eq('id', selectedSchedule)

      alert('Swap request submitted successfully!')
      setShowRequestForm(false)
      setSelectedSchedule('')
      setSwapWithEmployee('')
      setSwapReason('')
      fetchData()
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit swap request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (requestId: string, originalScheduleId: string) => {
    if (!currentUser) return

    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({
          status: 'approved',
          approved_by: currentUser.id
        })
        .eq('id', requestId)

      if (error) throw error

      // Update schedule status
      await supabase
        .from('employee_schedules')
        .update({ status: 'completed' })
        .eq('id', originalScheduleId)

      alert('Swap request approved!')
      fetchData()
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request. Please try again.')
    }
  }

  const handleDeny = async (requestId: string, originalScheduleId: string) => {
    if (!currentUser) return

    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({
          status: 'denied',
          approved_by: currentUser.id
        })
        .eq('id', requestId)

      if (error) throw error

      // Restore schedule status
      await supabase
        .from('employee_schedules')
        .update({ status: 'scheduled' })
        .eq('id', originalScheduleId)

      alert('Swap request denied.')
      fetchData()
    } catch (error) {
      console.error('Error denying request:', error)
      alert('Failed to deny request. Please try again.')
    }
  }

  const handleCancel = async (requestId: string, originalScheduleId: string) => {
    if (!confirm('Are you sure you want to cancel this swap request?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('shift_swap_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)

      if (error) throw error

      // Restore schedule status
      await supabase
        .from('employee_schedules')
        .update({ status: 'scheduled' })
        .eq('id', originalScheduleId)

      alert('Swap request cancelled.')
      fetchData()
    } catch (error) {
      console.error('Error cancelling request:', error)
      alert('Failed to cancel request. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
          label: 'Pending'
        }
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
          label: 'Approved'
        }
      case 'denied':
        return {
          icon: XCircle,
          color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
          label: 'Denied'
        }
      case 'cancelled':
        return {
          icon: AlertCircle,
          color: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300',
          label: 'Cancelled'
        }
      default:
        return {
          icon: Clock,
          color: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300',
          label: 'Unknown'
        }
    }
  }

  const canManageRequests = currentUser && ['admin', 'manager'].includes(currentUser.role)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500"></div>
          <p className="text-seahawks-navy dark:text-purple-400 font-semibold">Loading Swap Requests...</p>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 shadow-lg">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-purple-600
                               dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
                  Shift Swap Requests
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                  {canManageRequests ? 'Manage all swap requests' : 'Request and track shift swaps'}
                </p>
              </div>
            </div>

            {!canManageRequests && mySchedules.length > 0 && (
              <button
                onClick={() => setShowRequestForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800
                           text-white rounded-xl font-semibold shadow-lg hover:shadow-xl
                           transition-all hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-5 h-5" />
                Request Swap
              </button>
            )}
          </div>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Request Shift Swap</h2>

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Select Your Shift *
                  </label>
                  <select
                    value={selectedSchedule}
                    onChange={(e) => setSelectedSchedule(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500
                               transition-all"
                    required
                  >
                    <option value="">Select a shift...</option>
                    {mySchedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {new Date(schedule.schedule_date).toLocaleDateString()} -{' '}
                        {schedule.shift_type.charAt(0).toUpperCase() + schedule.shift_type.slice(1)} ({schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Swap With (Optional)
                  </label>
                  <select
                    value={swapWithEmployee}
                    onChange={(e) => setSwapWithEmployee(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500
                               transition-all"
                  >
                    <option value="">Anyone available...</option>
                    {employees
                      .filter(emp => emp.id !== currentUser?.id)
                      .map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.full_name || employee.email}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Leave blank to allow any employee to swap
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500
                               transition-all"
                    placeholder="Why do you need to swap this shift?"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl font-bold
                               bg-gradient-to-r from-purple-600 to-purple-800
                               hover:from-purple-700 hover:to-purple-900
                               text-white shadow-lg hover:shadow-xl
                               transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-6 py-3 rounded-xl font-semibold
                               bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
                               hover:bg-slate-200 dark:hover:bg-slate-600
                               transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Swap Requests List */}
        <div>
          {swapRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <RefreshCw className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-6">No swap requests yet</p>
              {!canManageRequests && mySchedules.length > 0 && (
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-800
                             text-white rounded-xl font-semibold shadow-lg hover:shadow-xl
                             transition-all hover:scale-105 active:scale-95"
                >
                  <RefreshCw className="w-5 h-5" />
                  Create First Request
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {swapRequests.map((request) => {
                const status = getStatusBadge(request.status)
                const StatusIcon = status.icon
                const canCancel = request.requested_by === currentUser?.id && request.status === 'pending'
                const canApprove = canManageRequests && request.status === 'pending'

                return (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                               p-6 shadow-md hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      {/* Request Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${status.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Employee
                            </div>
                            <div className="text-lg font-bold text-slate-900 dark:text-white">
                              {request.requester.full_name || 'Unknown'}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Shift Date
                            </div>
                            <div className="text-lg text-slate-900 dark:text-white">
                              {new Date(request.original_schedule.schedule_date).toLocaleDateString()}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Shift Type
                            </div>
                            <div className="text-lg text-slate-900 dark:text-white">
                              {request.original_schedule.shift_type.charAt(0).toUpperCase() + request.original_schedule.shift_type.slice(1)}
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Time
                            </div>
                            <div className="text-lg text-slate-900 dark:text-white">
                              {request.original_schedule.start_time.slice(0, 5)} - {request.original_schedule.end_time.slice(0, 5)}
                            </div>
                          </div>
                        </div>

                        {request.swap_target && (
                          <div className="mb-4">
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Swap With
                            </div>
                            <div className="text-lg text-slate-900 dark:text-white">
                              {request.swap_target.full_name || 'Unknown'}
                            </div>
                          </div>
                        )}

                        {request.reason && (
                          <div className="mb-4">
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              Reason
                            </div>
                            <div className="text-slate-900 dark:text-white">
                              {request.reason}
                            </div>
                          </div>
                        )}

                        {request.approver && (
                          <div>
                            <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              {request.status === 'approved' ? 'Approved By' : 'Denied By'}
                            </div>
                            <div className="text-slate-900 dark:text-white">
                              {request.approver.full_name || 'Unknown'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {(canApprove || canCancel) && (
                        <div className="flex flex-col gap-2">
                          {canApprove && (
                            <>
                              <button
                                onClick={() => handleApprove(request.id, request.original_schedule_id)}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3
                                           bg-gradient-to-r from-green-500 to-green-600
                                           text-white rounded-lg font-semibold
                                           hover:from-green-600 hover:to-green-700
                                           transition-all hover:scale-105 active:scale-95"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleDeny(request.id, request.original_schedule_id)}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3
                                           bg-red-500 text-white rounded-lg font-semibold
                                           hover:bg-red-600 transition-all hover:scale-105 active:scale-95"
                              >
                                <XCircle className="w-4 h-4" />
                                Deny
                              </button>
                            </>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => handleCancel(request.id, request.original_schedule_id)}
                              className="inline-flex items-center justify-center gap-2 px-6 py-3
                                         bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
                                         rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600
                                         transition-all hover:scale-105 active:scale-95"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel Request
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
