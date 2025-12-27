'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Plus } from 'lucide-react'

const MACHINES = [
  { id: '1', name: 'Zamboni #1 (Electric)', type: 'electric' },
  { id: '2', name: 'Zamboni #2 (Gas)', type: 'gas' },
  { id: '3', name: 'Olympia (Electric)', type: 'electric' },
]

const RINKS = [
  { id: '1', name: 'Main Rink' },
  { id: '2', name: 'Practice Rink' },
]

export function IceMakeLogForm() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [recentMakes, setRecentMakes] = useState<any[]>([])

  // Auto-populated fields
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  )

  // Form fields
  const [machineId, setMachineId] = useState('')
  const [rinkId, setRinkId] = useState('')
  const [makeType, setMakeType] = useState<'wet' | 'dry'>('wet')
  const [waterUsed, setWaterUsed] = useState('')
  const [snowPercentage, setSnowPercentage] = useState('50')
  const [batteryStart, setBatteryStart] = useState('')
  const [batteryFinish, setBatteryFinish] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    checkUser()
    fetchRecentMakes()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchRecentMakes = async () => {
    try {
      const { data, error } = await supabase
        .from('ice_makes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentMakes(data || [])
    } catch (error) {
      console.error('Error fetching ice makes:', error)
    }
  }

  const getSelectedMachine = () => {
    return MACHINES.find((m) => m.id === machineId)
  }

  const isElectricMachine = () => {
    const machine = getSelectedMachine()
    return machine?.type === 'electric'
  }

  const validateForm = () => {
    if (!machineId) {
      alert('Please select a machine')
      return false
    }

    if (!rinkId) {
      alert('Please select a rink')
      return false
    }

    if (makeType === 'wet' && !waterUsed) {
      alert('Please enter water used for wet cut')
      return false
    }

    if (!snowPercentage || parseInt(snowPercentage) < 0 || parseInt(snowPercentage) > 100) {
      alert('Please enter snow percentage (0-100%)')
      return false
    }

    if (isElectricMachine()) {
      if (!batteryStart || !batteryFinish) {
        alert('Please enter battery start and finish percentages for electric machine')
        return false
      }
    }

    if (notes && notes.length > 500) {
      alert('Notes must be 500 characters or less')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      const { error } = await supabase.from('ice_makes').insert({
        facility_id: '00000000-0000-0000-0000-000000000000', // Placeholder
        machine_id: machineId,
        rink_id: rinkId,
        operator_id: user?.id || '00000000-0000-0000-0000-000000000000',
        make_date: currentDate,
        make_time: currentTime,
        type: makeType,
        water_used_gallons: makeType === 'wet' ? parseFloat(waterUsed) : null,
        snow_percentage: parseInt(snowPercentage),
        battery_start_percentage: isElectricMachine() ? parseInt(batteryStart) : null,
        battery_finish_percentage: isElectricMachine() ? parseInt(batteryFinish) : null,
        notes: notes || null,
      })

      if (error) throw error

      // Reset form
      setMachineId('')
      setRinkId('')
      setMakeType('wet')
      setWaterUsed('')
      setSnowPercentage('50')
      setBatteryStart('')
      setBatteryFinish('')
      setNotes('')

      // Refresh recent makes
      fetchRecentMakes()

      alert('Ice make logged successfully!')
    } catch (error) {
      console.error('Error logging ice make:', error)
      alert('Error logging ice make')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Log New Ice Make</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Auto-populated fields (read-only display) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Date
            </label>
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600">
              {new Date(currentDate).toLocaleDateString()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Time
            </label>
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600">
              {currentTime}
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
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {/* Rink */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Rink <span className="text-red-500">*</span>
            </label>
            <select
              value={rinkId}
              onChange={(e) => setRinkId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select rink...</option>
              {RINKS.map((rink) => (
                <option key={rink.id} value={rink.id}>
                  {rink.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Toggle (Wet/Dry) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setMakeType('wet')}
                className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                  makeType === 'wet'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Wet Cut 💧
              </button>
              <button
                type="button"
                onClick={() => setMakeType('dry')}
                className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all ${
                  makeType === 'dry'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Dry Cut ❄️
              </button>
            </div>
          </div>

          {/* Water Used (only for wet cut) */}
          {makeType === 'wet' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Water Used (gallons) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={waterUsed}
                onChange={(e) => setWaterUsed(e.target.value)}
                min="0"
                step="0.1"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                         bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
                required
              />
            </div>
          )}

          {/* Snow Percentage */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Snow in Tank (%) <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <input
                type="range"
                value={snowPercentage}
                onChange={(e) => setSnowPercentage(e.target.value)}
                min="0"
                max="100"
                step="5"
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">0%</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {snowPercentage}%
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">100%</span>
              </div>
            </div>
          </div>

          {/* Battery levels (only for electric machines) */}
          {isElectricMachine() && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Battery Start (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={batteryStart}
                  onChange={(e) => setBatteryStart(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Battery Finish (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={batteryFinish}
                  onChange={(e) => setBatteryFinish(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0-100"
                  required
                />
              </div>
            </>
          )}

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Notes (max 500 characters)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                       bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observations, ice conditions, etc..."
            />
            <div className="text-right text-sm text-slate-500 dark:text-slate-400 mt-1">
              {notes.length}/500
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600
                     text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30
                     hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:scale-105 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Logging...' : 'Log Ice Make'}
          </button>
        </div>
      </div>

      {/* Recent Makes */}
      {recentMakes.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Ice Makes (Today)</h3>
          <div className="space-y-3">
            {recentMakes.map((make) => (
              <div
                key={make.id}
                className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {MACHINES.find((m) => m.id === make.machine_id)?.name || 'Unknown Machine'} -{' '}
                      {RINKS.find((r) => r.id === make.rink_id)?.name || 'Unknown Rink'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {make.make_time} • {make.type === 'wet' ? '💧 Wet Cut' : '❄️ Dry Cut'} •
                      Snow: {make.snow_percentage}%
                      {make.water_used_gallons && ` • Water: ${make.water_used_gallons}gal`}
                    </div>
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
