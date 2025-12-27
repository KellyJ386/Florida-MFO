'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, AlertTriangle, Clock } from 'lucide-react'

const MACHINES = [
  { id: '1', name: 'Zamboni #1 (Electric)' },
  { id: '2', name: 'Zamboni #2 (Gas)' },
  { id: '3', name: 'Olympia (Electric)' },
]

export function BladeChangeLogForm() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [recentChanges, setRecentChanges] = useState<any[]>([])
  const [activeAlerts, setActiveAlerts] = useState<any[]>([])

  // Form fields
  const [machineId, setMachineId] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    checkUser()
    fetchRecentChanges()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      setUserProfile(profileData)
    }
  }

  const fetchRecentChanges = async () => {
    try {
      const { data, error } = await supabase
        .from('blade_changes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      // Filter active alerts (within 7 days)
      const now = new Date()
      const alerts = (data || []).filter((change) => {
        if (!change.alert_expires_at) return false
        return new Date(change.alert_expires_at) > now
      })

      setRecentChanges(data || [])
      setActiveAlerts(alerts)
    } catch (error) {
      console.error('Error fetching blade changes:', error)
    }
  }

  const validateForm = () => {
    if (!machineId) {
      alert('Please select a machine')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      // Calculate alert expiration (7 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const { error } = await supabase.from('blade_changes').insert({
        facility_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        machine_id: machineId,
        changed_by: user?.id || '00000000-0000-0000-0000-000000000000',
        change_date: new Date().toISOString().split('T')[0],
        change_time: new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        }),
        notes: notes || null,
        alert_expires_at: expiresAt.toISOString(),
        acknowledged_by: [],
      })

      if (error) throw error

      // Reset form
      setMachineId('')
      setNotes('')

      // Refresh blade changes
      fetchRecentChanges()

      alert(
        '✅ Blade change logged successfully!\n\n7-day alert has been created for all operators.'
      )
    } catch (error) {
      console.error('Error logging blade change:', error)
      alert('Error logging blade change')
    } finally {
      setLoading(false)
    }
  }

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffTime = expires.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMachineName = (machineId: string) => {
    return MACHINES.find((m) => m.id === machineId)?.name || 'Unknown Machine'
  }

  return (
    <div className="space-y-8">
      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-500" />
            Active Blade Change Alerts
          </h3>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 shadow-xl text-white"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="text-xl font-bold mb-2">
                      ⚠️ FRESH BLADE ALERT - {getMachineName(alert.machine_id)}
                    </h4>
                    <p className="text-white/90 mb-1">
                      Blade changed on {new Date(alert.change_date).toLocaleDateString()} at{' '}
                      {alert.change_time}
                    </p>
                    <p className="text-sm text-white/80">
                      Exercise caution on first few cuts - fresh blade!
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {getDaysRemaining(alert.alert_expires_at)} days left
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Blade Change Form */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Log Blade Change</h3>

        <div className="space-y-6">
          {/* Auto-populated: Who Performed Change */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Performed By
            </label>
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600">
              {userProfile?.full_name || user?.email || 'Unknown Operator'}
            </div>
          </div>

          {/* Machine */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Machine <span className="text-red-500">*</span>
            </label>
            <select
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select machine...</option>
              {MACHINES.map((machine) => (
                <option key={machine.id} value={machine.id}>
                  {machine.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Reason for change, blade condition, any issues..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <p className="font-semibold mb-1">7-Day Alert Will Be Created</p>
                <p>
                  When you log this blade change, all operators will see an alert for 7 days on the
                  Ice Make Log page, Dashboard, and mobile app to exercise caution with fresh blades.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600
                     text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30
                     hover:shadow-xl hover:shadow-orange-500/40 transition-all hover:scale-105 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Logging...' : 'Log Blade Change & Create Alert'}
          </button>
        </div>
      </div>

      {/* Blade Change History */}
      {recentChanges.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Blade Change History
          </h3>
          <div className="space-y-3">
            {recentChanges.map((change) => {
              const isActive = activeAlerts.some((alert) => alert.id === change.id)
              return (
                <div
                  key={change.id}
                  className={`rounded-lg p-4 border ${
                    isActive
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {getMachineName(change.machine_id)}
                        {isActive && (
                          <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-bold">
                            ACTIVE ALERT
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(change.change_date).toLocaleDateString()} at {change.change_time}
                      </div>
                      {change.notes && (
                        <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                          {change.notes}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <div className="text-right">
                        <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                          {getDaysRemaining(change.alert_expires_at)} days left
                        </div>
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
  )
}
