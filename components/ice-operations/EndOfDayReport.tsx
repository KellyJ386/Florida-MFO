'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, TrendingUp, Droplet, Snowflake, Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react'

const MACHINES = [
  { id: '1', name: 'Zamboni #1 (Electric)' },
  { id: '2', name: 'Zamboni #2 (Gas)' },
  { id: '3', name: 'Olympia (Electric)' },
]

export function EndOfDayReport() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [todayDate] = useState(new Date().toISOString().split('T')[0])

  // Summary data
  const [iceMakes, setIceMakes] = useState<any[]>([])
  const [bladeChanges, setBladeChanges] = useState<any[]>([])
  const [circleChecks, setCircleChecks] = useState<any[]>([])

  useEffect(() => {
    fetchTodayData()
  }, [])

  const fetchTodayData = async () => {
    setLoading(true)
    try {
      // Fetch today's ice makes
      const { data: makesData } = await supabase
        .from('ice_makes')
        .select('*')
        .eq('make_date', todayDate)
        .order('make_time', { ascending: true })

      // Fetch today's blade changes
      const { data: bladesData } = await supabase
        .from('blade_changes')
        .select('*')
        .eq('change_date', todayDate)
        .order('change_time', { ascending: true })

      // Fetch today's circle checks
      const { data: checksData } = await supabase
        .from('circle_checks')
        .select('*')
        .eq('check_date', todayDate)
        .order('check_time', { ascending: true })

      setIceMakes(makesData || [])
      setBladeChanges(bladesData || [])
      setCircleChecks(checksData || [])
    } catch (error) {
      console.error('Error fetching today data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalWaterUsed = () => {
    return iceMakes
      .filter((make) => make.water_used_gallons)
      .reduce((sum, make) => sum + (make.water_used_gallons || 0), 0)
  }

  const getAverageSnow = () => {
    if (iceMakes.length === 0) return 0
    const total = iceMakes.reduce((sum, make) => sum + make.snow_percentage, 0)
    return Math.round(total / iceMakes.length)
  }

  const getFailedChecks = () => {
    return circleChecks.filter((check) => check.failed_checkpoints > 0)
  }

  const getMachineName = (machineId: string) => {
    return MACHINES.find((m) => m.id === machineId)?.name || 'Unknown Machine'
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Loading today's summary...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          End of Day Report
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {new Date(todayDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Snowflake className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">{iceMakes.length}</div>
          <div className="text-blue-100 text-sm">Total Ice Makes</div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Droplet className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">{getTotalWaterUsed().toFixed(1)}</div>
          <div className="text-cyan-100 text-sm">Gallons Water Used</div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">{getAverageSnow()}%</div>
          <div className="text-indigo-100 text-sm">Avg Snow Accumulation</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Wrench className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">{bladeChanges.length}</div>
          <div className="text-orange-100 text-sm">Blade Changes</div>
        </div>
      </div>

      {/* Ice Makes Details */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Snowflake className="w-5 h-5 text-blue-500" />
          Ice Makes ({iceMakes.length})
        </h3>
        {iceMakes.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">No ice makes recorded today</p>
        ) : (
          <div className="space-y-2">
            {iceMakes.map((make, index) => (
              <div
                key={make.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg"
              >
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {make.make_time} - {getMachineName(make.machine_id)}
                  </span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-3">
                    {make.type === 'wet' ? '💧 Wet' : '❄️ Dry'} • Snow: {make.snow_percentage}%
                    {make.water_used_gallons && ` • Water: ${make.water_used_gallons}gal`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blade Changes */}
      {bladeChanges.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-500" />
            Blade Changes ({bladeChanges.length})
          </h3>
          <div className="space-y-2">
            {bladeChanges.map((change) => (
              <div
                key={change.id}
                className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
              >
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {change.change_time} - {getMachineName(change.machine_id)}
                  </span>
                  {change.notes && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {change.notes}
                    </div>
                  )}
                </div>
                <div className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full font-bold">
                  7-DAY ALERT ACTIVE
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed Circle Checks */}
      {getFailedChecks().length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-500 dark:border-red-700 p-6">
          <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Failed Circle Checks ({getFailedChecks().length})
          </h3>
          <div className="space-y-3">
            {getFailedChecks().map((check) => (
              <div
                key={check.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-slate-900/50 rounded-lg"
              >
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {check.check_time} - {getMachineName(check.machine_id)}
                  </span>
                  <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {check.failed_checkpoints} checkpoint(s) failed
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {check.passed_checkpoints}/{check.total_checkpoints} passed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Circle Checks Summary */}
      {circleChecks.length > 0 && getFailedChecks().length === 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-500 dark:border-green-700 p-6">
          <h3 className="text-xl font-bold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            All Circle Checks Passed
          </h3>
          <p className="text-green-700 dark:text-green-300">
            {circleChecks.length} circle check(s) completed today with all checkpoints passing.
          </p>
        </div>
      )}

      {/* Shift Notes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-500" />
          Shift Notes & Observations
        </h3>
        <textarea
          rows={6}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                   bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="General observations, issues encountered, maintenance needed, notes for next shift..."
        />
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          <p className="font-semibold mb-2">Suggested items to include:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ice quality observations</li>
            <li>Equipment performance issues</li>
            <li>Upcoming maintenance needed</li>
            <li>Staff notes for next shift</li>
            <li>Unusual incidents or observations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
