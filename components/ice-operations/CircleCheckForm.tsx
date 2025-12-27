'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

const MACHINES = [
  { id: '1', name: 'Zamboni #1 (Electric)', type: 'electric' },
  { id: '2', name: 'Zamboni #2 (Gas)', type: 'gas' },
  { id: '3', name: 'Olympia (Electric)', type: 'electric' },
]

const GAS_CHECKPOINTS = [
  'Engine oil level',
  'Coolant level',
  'Hydraulic fluid level',
  'Fuel level',
  'Tire pressure - all tires',
  'Blade condition - sharp and secure',
  'Snow tank completely empty',
  'Water tank filled',
  'Headlights functioning',
  'Taillights functioning',
  'Brake lights functioning',
  'Turn signals functioning',
  'Brakes functional',
  'Steering responsive',
  'Seat belt condition',
  'Fire extinguisher charged',
  'Auger rotation smooth',
  'Conditioner cloth clean',
  'Spray jets clear',
  'Wash water system working',
  'Towel bar secure',
  'Scraper bar secure',
  'Snow tank door closes properly',
  'Water tank door closes properly',
  'No fluid leaks visible',
  'Mirrors clean and adjusted',
  'Horn functioning',
  'Emergency shut-off working',
  'Dashboard gauges operational',
  'Overall machine cleanliness',
]

const ELECTRIC_CHECKPOINTS = [
  'Battery charge level adequate',
  'Battery connections tight',
  'Hydraulic fluid level',
  'Tire pressure - all tires',
  'Blade condition - sharp and secure',
  'Snow tank completely empty',
  'Water tank filled',
  'Headlights functioning',
  'Taillights functioning',
  'Brake lights functioning',
  'Turn signals functioning',
  'Brakes functional',
  'Steering responsive',
  'Seat belt condition',
  'Fire extinguisher charged',
  'Auger rotation smooth',
  'Conditioner cloth clean',
  'Spray jets clear',
  'Wash water system working',
  'Towel bar secure',
  'Scraper bar secure',
  'Snow tank door closes properly',
  'Water tank door closes properly',
  'No fluid leaks visible',
  'Mirrors clean and adjusted',
  'Horn functioning',
  'Emergency shut-off working',
  'Dashboard gauges operational',
  'Charger disconnected properly',
  'Overall machine cleanliness',
]

export function CircleCheckForm() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Form fields
  const [machineId, setMachineId] = useState('')
  const [checkpoints, setCheckpoints] = useState<Record<string, boolean>>({})
  const [recentChecks, setRecentChecks] = useState<any[]>([])

  useEffect(() => {
    checkUser()
    fetchRecentChecks()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchRecentChecks = async () => {
    try {
      const { data, error } = await supabase
        .from('circle_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setRecentChecks(data || [])
    } catch (error) {
      console.error('Error fetching circle checks:', error)
    }
  }

  const getCheckpointList = () => {
    const machine = MACHINES.find((m) => m.id === machineId)
    if (!machine) return []
    return machine.type === 'electric' ? ELECTRIC_CHECKPOINTS : GAS_CHECKPOINTS
  }

  const handleCheckpointToggle = (checkpoint: string) => {
    setCheckpoints({
      ...checkpoints,
      [checkpoint]: !checkpoints[checkpoint],
    })
  }

  const getCheckStats = () => {
    const list = getCheckpointList()
    const total = list.length
    const passed = list.filter((cp) => checkpoints[cp] === true).length
    const failed = list.filter((cp) => checkpoints[cp] === false).length
    const unchecked = total - passed - failed
    return { total, passed, failed, unchecked }
  }

  const validateForm = () => {
    if (!machineId) {
      alert('Please select a machine')
      return false
    }

    const stats = getCheckStats()
    if (stats.unchecked > 0) {
      alert(`Please complete all checkpoints. ${stats.unchecked} remaining.`)
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const stats = getCheckStats()

    // Check if there are failures
    if (stats.failed > 0) {
      const failedItems = getCheckpointList()
        .filter((cp) => checkpoints[cp] === false)
        .join(', ')

      if (
        !confirm(
          `⚠️ WARNING: ${stats.failed} checkpoint(s) failed!\n\nFailed items: ${failedItems}\n\nManagement will be notified. Continue?`
        )
      ) {
        return
      }
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('circle_checks').insert({
        facility_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        machine_id: machineId,
        operator_id: user?.id || '00000000-0000-0000-0000-000000000000',
        check_date: new Date().toISOString().split('T')[0],
        check_time: new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        }),
        checkpoints: checkpoints,
        total_checkpoints: stats.total,
        passed_checkpoints: stats.passed,
        failed_checkpoints: stats.failed,
      })

      if (error) throw error

      // Reset form
      setMachineId('')
      setCheckpoints({})

      // Refresh recent checks
      fetchRecentChecks()

      if (stats.failed > 0) {
        alert(
          `✅ Circle check submitted!\n\n⚠️ ${stats.failed} failure(s) recorded. Management has been notified.`
        )
      } else {
        alert('✅ Circle check submitted! All checkpoints passed.')
      }
    } catch (error) {
      console.error('Error submitting circle check:', error)
      alert('Error submitting circle check')
    } finally {
      setLoading(false)
    }
  }

  const stats = getCheckStats()

  return (
    <div className="space-y-8">
      {/* Circle Check Form */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Pre-Operation Circle Check
        </h3>

        {/* Machine Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Machine <span className="text-red-500">*</span>
          </label>
          <select
            value={machineId}
            onChange={(e) => {
              setMachineId(e.target.value)
              setCheckpoints({}) // Reset checkpoints when machine changes
            }}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

        {/* Stats Display */}
        {machineId && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.passed}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">Passed</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center border border-red-200 dark:border-red-800">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</div>
              <div className="text-xs text-red-600 dark:text-red-400">Failed</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center border border-slate-300 dark:border-slate-600">
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                {stats.unchecked}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Remaining</div>
            </div>
          </div>
        )}

        {/* Checkpoints List */}
        {machineId && (
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
              Checkpoints ({stats.total})
            </h4>
            <div className="space-y-2">
              {getCheckpointList().map((checkpoint, index) => {
                const status = checkpoints[checkpoint]
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      status === true
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-700'
                        : status === false
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-700'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-8">
                          #{index + 1}
                        </span>
                        <span className="text-slate-900 dark:text-white">{checkpoint}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCheckpointToggle(checkpoint)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                            status === true
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Pass
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCheckpoints({ ...checkpoints, [checkpoint]: false })
                          }
                          className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                            status === false
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          Fail
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Warning for failures */}
        {stats.failed > 0 && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-900 dark:text-red-200">
                <p className="font-semibold mb-1">
                  {stats.failed} Checkpoint(s) Failed
                </p>
                <p>Failed checkpoints will be highlighted in red and management will be notified automatically. The machine is NOT blocked from operation.</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {machineId && (
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading || stats.unchecked > 0}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600
                       text-white rounded-xl font-semibold shadow-lg shadow-green-500/30
                       hover:shadow-xl hover:shadow-green-500/40 transition-all hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Submitting...' : `Submit Circle Check (${stats.unchecked} remaining)`}
            </button>
          </div>
        )}
      </div>

      {/* Recent Circle Checks */}
      {recentChecks.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Circle Checks</h3>
          <div className="space-y-3">
            {recentChecks.map((check) => (
              <div
                key={check.id}
                className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {MACHINES.find((m) => m.id === check.machine_id)?.name || 'Unknown Machine'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(check.check_date).toLocaleDateString()} at {check.check_time}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {check.passed_checkpoints}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Passed</div>
                    </div>
                    {check.failed_checkpoints > 0 && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {check.failed_checkpoints}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Failed</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
