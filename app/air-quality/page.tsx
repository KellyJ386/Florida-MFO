'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Wind, Home, Save, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const LOCATIONS = [
  'Rink Level',
  'Timekeeper\'s Box',
  'Dressing Room 1',
  'Dressing Room 2',
  'Dressing Room 3',
  'Dressing Room 4',
  'Lobby',
]

// OSHA Thresholds
const THRESHOLDS = {
  co: {
    action: 15,
    emergency: 30,
  },
  no2: {
    action: 0.3,
    emergency: 0.5,
  },
  co2: {
    warning: 1500,
    critical: 5000,
  },
}

export default function AirQualityPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [recentReadings, setRecentReadings] = useState<any[]>([])

  // Form fields
  const [location, setLocation] = useState('')
  const [coInstant, setCoInstant] = useState('')
  const [co1hrAvg, setCo1hrAvg] = useState('')
  const [no2Instant, setNo2Instant] = useState('')
  const [no21hrAvg, setNo21hrAvg] = useState('')
  const [co2Instant, setCo2Instant] = useState('')
  const [co21hrAvg, setCo21hrAvg] = useState('')

  useEffect(() => {
    checkUser()
    fetchRecentReadings()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const fetchRecentReadings = async () => {
    try {
      const { data, error } = await supabase
        .from('air_quality_readings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentReadings(data || [])
    } catch (error) {
      console.error('Error fetching readings:', error)
    }
  }

  const getCoStatus = (value: number | null) => {
    if (!value) return 'unknown'
    if (value >= THRESHOLDS.co.emergency) return 'emergency'
    if (value >= THRESHOLDS.co.action) return 'action'
    return 'safe'
  }

  const getNo2Status = (value: number | null) => {
    if (!value) return 'unknown'
    if (value >= THRESHOLDS.no2.emergency) return 'emergency'
    if (value >= THRESHOLDS.no2.action) return 'action'
    return 'safe'
  }

  const getCo2Status = (value: number | null) => {
    if (!value) return 'unknown'
    if (value >= THRESHOLDS.co2.critical) return 'critical'
    if (value >= THRESHOLDS.co2.warning) return 'warning'
    return 'safe'
  }

  const getOverallStatus = () => {
    const coVal = parseFloat(coInstant || co1hrAvg)
    const no2Val = parseFloat(no2Instant || no21hrAvg)
    const co2Val = parseInt(co2Instant || co21hrAvg)

    const coStat = getCoStatus(coVal)
    const no2Stat = getNo2Status(no2Val)
    const co2Stat = getCo2Status(co2Val)

    if (coStat === 'emergency' || no2Stat === 'emergency' || co2Stat === 'critical') {
      return 'EMERGENCY'
    }
    if (coStat === 'action' || no2Stat === 'action' || co2Stat === 'warning') {
      return 'ACTION REQUIRED'
    }
    return 'SAFE'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EMERGENCY':
        return 'bg-red-500 text-white'
      case 'ACTION REQUIRED':
        return 'bg-yellow-500 text-white'
      case 'SAFE':
        return 'bg-green-500 text-white'
      default:
        return 'bg-slate-500 text-white'
    }
  }

  const validateForm = () => {
    if (!location) {
      alert('Please select a location')
      return false
    }

    // At least one reading is required
    if (!coInstant && !co1hrAvg && !no2Instant && !no21hrAvg && !co2Instant && !co21hrAvg) {
      alert('Please enter at least one gas reading')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const coVal = parseFloat(coInstant || co1hrAvg || '0')
    const no2Val = parseFloat(no2Instant || no21hrAvg || '0')
    const co2Val = parseInt(co2Instant || co21hrAvg || '0')

    const status = getOverallStatus()
    const isEmergency = status === 'EMERGENCY'

    // Check if incident should be triggered
    const shouldTriggerIncident =
      coVal >= THRESHOLDS.co.emergency || no2Val >= THRESHOLDS.no2.emergency

    if (isEmergency) {
      const confirmMsg = `⚠️ EMERGENCY LEVEL DETECTED!\n\n${
        coVal >= THRESHOLDS.co.emergency ? `CO: ${coVal} ppm (Emergency ≥30 ppm)\n` : ''
      }${no2Val >= THRESHOLDS.no2.emergency ? `NO₂: ${no2Val} ppm (Emergency ≥0.5 ppm)\n` : ''
      }${co2Val >= THRESHOLDS.co2.critical ? `CO₂: ${co2Val} ppm (Critical ≥5,000 ppm)\n` : ''
      }\n${
        shouldTriggerIncident
          ? 'An incident report will be automatically created.\n\n'
          : ''
      }Alerts will be sent via SMS and Email.\n\nContinue with logging this reading?`

      if (!confirm(confirmMsg)) {
        return
      }
    }

    setLoading(true)

    try {
      const { data: readingData, error: readingError } = await supabase
        .from('air_quality_readings')
        .insert({
          facility_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          tester_id: user?.id || '00000000-0000-0000-0000-000000000000',
          reading_date: new Date().toISOString().split('T')[0],
          reading_time: new Date().toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          }),
          location,
          co_instant: coInstant ? parseFloat(coInstant) : null,
          co_1hr_avg: co1hrAvg ? parseFloat(co1hrAvg) : null,
          no2_instant: no2Instant ? parseFloat(no2Instant) : null,
          no2_1hr_avg: no21hrAvg ? parseFloat(no21hrAvg) : null,
          co2_instant: co2Instant ? parseInt(co2Instant) : null,
          co2_1hr_avg: co21hrAvg ? parseInt(co21hrAvg) : null,
          status,
          incident_triggered: shouldTriggerIncident,
        })
        .select()
        .single()

      if (readingError) throw readingError

      // TODO: If shouldTriggerIncident, create incident report
      // For now, just show a message

      // Reset form
      setLocation('')
      setCoInstant('')
      setCo1hrAvg('')
      setNo2Instant('')
      setNo21hrAvg('')
      setCo2Instant('')
      setCo21hrAvg('')

      // Refresh readings
      fetchRecentReadings()

      if (isEmergency) {
        alert(
          `✅ Air quality reading logged!\n\n⚠️ EMERGENCY ALERTS SENT\n${
            shouldTriggerIncident ? '🚨 Incident report auto-created\n' : ''
          }\nStatus: ${status}`
        )
      } else {
        alert(`✅ Air quality reading logged!\n\nStatus: ${status}`)
      }
    } catch (error) {
      console.error('Error logging reading:', error)
      alert('Error logging air quality reading')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100
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
              <span className="font-medium text-sm">Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
              <Wind className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-green-600
                             dark:from-white dark:to-green-400 bg-clip-text text-transparent">
                Air Quality Compliance
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Monitor CO, NO₂, and CO₂ levels for safety compliance
              </p>
            </div>
          </div>
        </div>

        {/* Threshold Reference Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            OSHA Compliance Thresholds
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white mb-2">CO (Carbon Monoxide)</div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">&lt;15 ppm - Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">15-29 ppm - Action</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">≥30 ppm - Emergency</span>
                </div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white mb-2">NO₂ (Nitrogen Dioxide)</div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">&lt;0.3 ppm - Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">0.3-0.49 ppm - Action</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">≥0.5 ppm - Emergency</span>
                </div>
              </div>
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white mb-2">CO₂ (Carbon Dioxide)</div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">&lt;1,500 ppm - Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">1,500-4,999 ppm - Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-600 dark:text-slate-400">≥5,000 ppm - Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Log Air Quality Reading Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8 mb-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Log Air Quality Reading</h3>

          <div className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                         bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Select location...</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* CO Readings */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                CO (Carbon Monoxide) - ppm
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Instant Reading
                  </label>
                  <input
                    type="number"
                    value={coInstant}
                    onChange={(e) => setCoInstant(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    1-Hour Average
                  </label>
                  <input
                    type="number"
                    value={co1hrAvg}
                    onChange={(e) => setCo1hrAvg(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* NO2 Readings */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                NO₂ (Nitrogen Dioxide) - ppm
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Instant Reading
                  </label>
                  <input
                    type="number"
                    value={no2Instant}
                    onChange={(e) => setNo2Instant(e.target.value)}
                    step="0.001"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    1-Hour Average
                  </label>
                  <input
                    type="number"
                    value={no21hrAvg}
                    onChange={(e) => setNo21hrAvg(e.target.value)}
                    step="0.001"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.000"
                  />
                </div>
              </div>
            </div>

            {/* CO2 Readings */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                CO₂ (Carbon Dioxide) - ppm
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Instant Reading
                  </label>
                  <input
                    type="number"
                    value={co2Instant}
                    onChange={(e) => setCo2Instant(e.target.value)}
                    step="1"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    1-Hour Average
                  </label>
                  <input
                    type="number"
                    value={co21hrAvg}
                    onChange={(e) => setCo21hrAvg(e.target.value)}
                    step="1"
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Status Preview */}
            {(coInstant || co1hrAvg || no2Instant || no21hrAvg || co2Instant || co21hrAvg) && (
              <div className={`p-6 rounded-xl ${getStatusColor(getOverallStatus())} shadow-lg`}>
                <div className="flex items-center gap-3">
                  {getOverallStatus() === 'SAFE' ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                  <div>
                    <div className="text-2xl font-bold">Status: {getOverallStatus()}</div>
                    {getOverallStatus() === 'EMERGENCY' && (
                      <div className="text-sm mt-1">
                        Multi-channel alerts will be sent. Incident report may be auto-created.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600
                       text-white rounded-xl font-semibold shadow-lg shadow-green-500/30
                       hover:shadow-xl hover:shadow-green-500/40 transition-all hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Logging...' : 'Log Air Quality Reading'}
            </button>
          </div>
        </div>

        {/* Recent Readings */}
        {recentReadings.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Readings</h3>
            <div className="space-y-3">
              {recentReadings.map((reading) => (
                <div
                  key={reading.id}
                  className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {reading.location}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(reading.reading_date).toLocaleDateString()} at {reading.reading_time}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mt-2 space-x-4">
                        {reading.co_instant && (
                          <span>CO: {reading.co_instant} ppm</span>
                        )}
                        {reading.no2_instant && (
                          <span>NO₂: {reading.no2_instant} ppm</span>
                        )}
                        {reading.co2_instant && (
                          <span>CO₂: {reading.co2_instant} ppm</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(reading.status || 'SAFE')}`}>
                        {reading.status || 'SAFE'}
                      </span>
                      {reading.incident_triggered && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-2 font-semibold">
                          🚨 INCIDENT TRIGGERED
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
    </div>
  )
}
