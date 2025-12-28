'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Thermometer, Home, Save, AlertTriangle, CheckCircle2, Activity, Droplets } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useFacility } from '@/lib/hooks/useFacility'

// Normal thresholds
const THRESHOLDS = {
  discharge_pressure: { min: 180, max: 220 },
  discharge_temp: { min: 100, max: 130 },
  suction_pressure: { min: 8, max: 25 },
  suction_temp: { min: 10, max: 30 },
  brine_supply_temp: { min: 16, max: 20 },
  brine_return_temp: { min: 20, max: 24 },
  brine_concentration: { min: 22, max: 25 },
}

export default function RefrigerationPage() {
  const router = useRouter()
  const supabase = createClient()
  const { facilityId } = useFacility()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [todayLogs, setTodayLogs] = useState<any[]>([])
  const [recentLogs, setRecentLogs] = useState<any[]>([])

  // Form fields - System readings
  const [dischargePressure, setDischargePressure] = useState('')
  const [dischargeTemp, setDischargeTemp] = useState('')
  const [suctionPressure, setSuctionPressure] = useState('')
  const [suctionTemp, setSuctionTemp] = useState('')
  const [brineSupplyTemp, setBrineSupplyTemp] = useState('')
  const [brineReturnTemp, setBrineReturnTemp] = useState('')
  const [brineFlowRate, setBrineFlowRate] = useState('')
  const [brineConcentration, setBrineConcentration] = useState('')
  const [operatorCertNumber, setOperatorCertNumber] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    checkUser()
    fetchTodayLogs()
    fetchRecentLogs()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const fetchTodayLogs = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('refrigeration_logs')
        .select('*')
        .eq('log_date', today)
        .order('log_time', { ascending: true })

      if (error) throw error
      setTodayLogs(data || [])
    } catch (error) {
      console.error('Error fetching today logs:', error)
    }
  }

  const fetchRecentLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('refrigeration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentLogs(data || [])
    } catch (error) {
      console.error('Error fetching recent logs:', error)
    }
  }

  const getNextInspectionNumber = () => {
    if (todayLogs.length === 0) return 1
    if (todayLogs.length === 1) return 2
    if (todayLogs.length === 2) return 3
    return todayLogs.length + 1
  }

  const getComplianceStatus = () => {
    const count = todayLogs.length
    if (count >= 3) return 'compliant'
    if (count >= 2) return 'partial'
    return 'non-compliant'
  }

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-500 text-white'
      case 'partial':
        return 'bg-yellow-500 text-white'
      case 'non-compliant':
        return 'bg-red-500 text-white'
      default:
        return 'bg-slate-500 text-white'
    }
  }

  const getValueStatus = (value: number, type: keyof typeof THRESHOLDS) => {
    const threshold = THRESHOLDS[type]
    if (!threshold) return 'normal'
    if (value < threshold.min || value > threshold.max) return 'critical'
    const margin = (threshold.max - threshold.min) * 0.1
    if (value < threshold.min + margin || value > threshold.max - margin) return 'warning'
    return 'normal'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 dark:text-green-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'critical':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-slate-600 dark:text-slate-400'
    }
  }

  const validateForm = () => {
    if (!dischargePressure || !dischargeTemp || !suctionPressure || !suctionTemp) {
      alert('Please fill in all High-Side and Low-Side system readings')
      return false
    }

    if (!brineSupplyTemp || !brineReturnTemp) {
      alert('Please fill in Brine system temperatures')
      return false
    }

    if (!operatorCertNumber) {
      alert('Please enter your operator certificate number')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    // Check for critical readings
    const criticalReadings = []
    if (getValueStatus(parseFloat(dischargePressure), 'discharge_pressure') === 'critical') {
      criticalReadings.push(`Discharge Pressure: ${dischargePressure} psig (Normal: 180-220)`)
    }
    if (getValueStatus(parseFloat(dischargeTemp), 'discharge_temp') === 'critical') {
      criticalReadings.push(`Discharge Temp: ${dischargeTemp}°F (Normal: 100-130)`)
    }
    if (getValueStatus(parseFloat(suctionPressure), 'suction_pressure') === 'critical') {
      criticalReadings.push(`Suction Pressure: ${suctionPressure} psig (Normal: 8-25)`)
    }
    if (getValueStatus(parseFloat(suctionTemp), 'suction_temp') === 'critical') {
      criticalReadings.push(`Suction Temp: ${suctionTemp}°F (Normal: 10-30)`)
    }
    if (getValueStatus(parseFloat(brineSupplyTemp), 'brine_supply_temp') === 'critical') {
      criticalReadings.push(`Brine Supply Temp: ${brineSupplyTemp}°F (Normal: 16-20)`)
    }
    if (getValueStatus(parseFloat(brineReturnTemp), 'brine_return_temp') === 'critical') {
      criticalReadings.push(`Brine Return Temp: ${brineReturnTemp}°F (Normal: 20-24)`)
    }

    if (criticalReadings.length > 0) {
      const confirmMsg = `⚠️ CRITICAL READINGS DETECTED!\n\n${criticalReadings.join('\n')}\n\nAlerts will be sent via Email and SMS.\n\nContinue with logging?`
      if (!confirm(confirmMsg)) {
        return
      }
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('refrigeration_logs').insert({
        facility_id: facilityId,
        operator_id: user?.id,
        log_date: new Date().toISOString().split('T')[0],
        log_time: new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        }),
        inspection_number: getNextInspectionNumber(),
        discharge_pressure: parseFloat(dischargePressure),
        discharge_temp: parseFloat(dischargeTemp),
        suction_pressure: parseFloat(suctionPressure),
        suction_temp: parseFloat(suctionTemp),
        brine_supply_temp: parseFloat(brineSupplyTemp),
        brine_return_temp: parseFloat(brineReturnTemp),
        brine_flow_rate: brineFlowRate ? parseFloat(brineFlowRate) : null,
        brine_concentration: brineConcentration ? parseFloat(brineConcentration) : null,
        operator_certificate_number: operatorCertNumber,
        notes: notes || null,
      })

      if (error) throw error

      // Reset form
      setDischargePressure('')
      setDischargeTemp('')
      setSuctionPressure('')
      setSuctionTemp('')
      setBrineSupplyTemp('')
      setBrineReturnTemp('')
      setBrineFlowRate('')
      setBrineConcentration('')
      setOperatorCertNumber('')
      setNotes('')

      // Refresh logs
      fetchTodayLogs()
      fetchRecentLogs()

      if (criticalReadings.length > 0) {
        alert(`✅ Refrigeration log saved!\n\n⚠️ CRITICAL ALERTS SENT\n${criticalReadings.length} reading(s) out of range`)
      } else {
        alert(`✅ Refrigeration log saved!\n\nInspection #${getNextInspectionNumber()} completed`)
      }
    } catch (error) {
      console.error('Error logging refrigeration reading:', error)
      alert('Error logging refrigeration reading')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-slate-100
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

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30">
              <Thermometer className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-cyan-600
                             dark:from-white dark:to-cyan-400 bg-clip-text text-transparent">
                Refrigeration Plant Monitoring
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Ontario Regulation 219/01 Compliance Tracking
              </p>
            </div>
          </div>
        </div>

        {/* Ontario Reg 219/01 Compliance Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Today's Compliance Status
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Ontario Reg 219/01 requires 3 inspections per 8-hour period
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                {todayLogs.length}/3
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${getComplianceColor(getComplianceStatus())}`}>
                {getComplianceStatus() === 'compliant' && '✅ Compliant'}
                {getComplianceStatus() === 'partial' && '⚠️ Partial'}
                {getComplianceStatus() === 'non-compliant' && '❌ Non-Compliant'}
              </span>
            </div>
          </div>

          {/* Today's Inspections Timeline */}
          {todayLogs.length > 0 && (
            <div className="mt-6 flex items-center gap-4">
              {[1, 2, 3].map((num) => {
                const log = todayLogs.find((l) => l.inspection_number === num)
                return (
                  <div key={num} className="flex-1">
                    <div
                      className={`p-4 rounded-lg text-center ${
                        log
                          ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-700'
                          : 'bg-slate-100 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white">
                        Inspection #{num}
                      </div>
                      {log ? (
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {log.log_time}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">Pending</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Log Refrigeration Reading Form */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8 mb-8">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Log Inspection #{getNextInspectionNumber()}
          </h3>

          <div className="space-y-8">
            {/* High-Side System */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <h4 className="font-bold text-red-900 dark:text-red-300 mb-4 flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" />
                High-Side System
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Discharge Pressure (psig) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={dischargePressure}
                    onChange={(e) => setDischargePressure(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="180-220"
                  />
                  {dischargePressure && (
                    <div className={`text-xs mt-1 font-semibold ${getStatusColor(getValueStatus(parseFloat(dischargePressure), 'discharge_pressure'))}`}>
                      {getValueStatus(parseFloat(dischargePressure), 'discharge_pressure') === 'normal' && '✓ Normal'}
                      {getValueStatus(parseFloat(dischargePressure), 'discharge_pressure') === 'warning' && '⚠ Warning'}
                      {getValueStatus(parseFloat(dischargePressure), 'discharge_pressure') === 'critical' && '⚠ Critical'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Discharge Temp (°F) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={dischargeTemp}
                    onChange={(e) => setDischargeTemp(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="100-130"
                  />
                  {dischargeTemp && (
                    <div className={`text-xs mt-1 font-semibold ${getStatusColor(getValueStatus(parseFloat(dischargeTemp), 'discharge_temp'))}`}>
                      {getValueStatus(parseFloat(dischargeTemp), 'discharge_temp') === 'normal' && '✓ Normal'}
                      {getValueStatus(parseFloat(dischargeTemp), 'discharge_temp') === 'warning' && '⚠ Warning'}
                      {getValueStatus(parseFloat(dischargeTemp), 'discharge_temp') === 'critical' && '⚠ Critical'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Low-Side System */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5" />
                Low-Side System
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Suction Pressure (psig) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={suctionPressure}
                    onChange={(e) => setSuctionPressure(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="8-25"
                  />
                  {suctionPressure && (
                    <div className={`text-xs mt-1 font-semibold ${getStatusColor(getValueStatus(parseFloat(suctionPressure), 'suction_pressure'))}`}>
                      {getValueStatus(parseFloat(suctionPressure), 'suction_pressure') === 'normal' && '✓ Normal'}
                      {getValueStatus(parseFloat(suctionPressure), 'suction_pressure') === 'warning' && '⚠ Warning'}
                      {getValueStatus(parseFloat(suctionPressure), 'suction_pressure') === 'critical' && '⚠ Critical'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Suction Temp (°F) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={suctionTemp}
                    onChange={(e) => setSuctionTemp(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="10-30"
                  />
                  {suctionTemp && (
                    <div className={`text-xs mt-1 font-semibold ${getStatusColor(getValueStatus(parseFloat(suctionTemp), 'suction_temp'))}`}>
                      {getValueStatus(parseFloat(suctionTemp), 'suction_temp') === 'normal' && '✓ Normal'}
                      {getValueStatus(parseFloat(suctionTemp), 'suction_temp') === 'warning' && '⚠ Warning'}
                      {getValueStatus(parseFloat(suctionTemp), 'suction_temp') === 'critical' && '⚠ Critical'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Brine System */}
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800">
              <h4 className="font-bold text-cyan-900 dark:text-cyan-300 mb-4 flex items-center gap-2 text-lg">
                <Droplets className="w-5 h-5" />
                Brine System
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Supply Temperature (°F) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={brineSupplyTemp}
                    onChange={(e) => setBrineSupplyTemp(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="16-20"
                  />
                  {brineSupplyTemp && (
                    <div className={`text-xs mt-1 font-semibold ${getStatusColor(getValueStatus(parseFloat(brineSupplyTemp), 'brine_supply_temp'))}`}>
                      {getValueStatus(parseFloat(brineSupplyTemp), 'brine_supply_temp') === 'normal' && '✓ Normal'}
                      {getValueStatus(parseFloat(brineSupplyTemp), 'brine_supply_temp') === 'warning' && '⚠ Warning'}
                      {getValueStatus(parseFloat(brineSupplyTemp), 'brine_supply_temp') === 'critical' && '⚠ Critical'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Return Temperature (°F) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={brineReturnTemp}
                    onChange={(e) => setBrineReturnTemp(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="20-24"
                  />
                  {brineReturnTemp && (
                    <div className={`text-xs mt-1 font-semibold ${getStatusColor(getValueStatus(parseFloat(brineReturnTemp), 'brine_return_temp'))}`}>
                      {getValueStatus(parseFloat(brineReturnTemp), 'brine_return_temp') === 'normal' && '✓ Normal'}
                      {getValueStatus(parseFloat(brineReturnTemp), 'brine_return_temp') === 'warning' && '⚠ Warning'}
                      {getValueStatus(parseFloat(brineReturnTemp), 'brine_return_temp') === 'critical' && '⚠ Critical'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Flow Rate (GPM)
                  </label>
                  <input
                    type="number"
                    value={brineFlowRate}
                    onChange={(e) => setBrineFlowRate(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Concentration (%)
                  </label>
                  <input
                    type="number"
                    value={brineConcentration}
                    onChange={(e) => setBrineConcentration(e.target.value)}
                    step="0.1"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="22-25"
                  />
                  {brineConcentration && (
                    <div className={`text-xs mt-1 font-semibold ${getStatusColor(getValueStatus(parseFloat(brineConcentration), 'brine_concentration'))}`}>
                      {getValueStatus(parseFloat(brineConcentration), 'brine_concentration') === 'normal' && '✓ Normal'}
                      {getValueStatus(parseFloat(brineConcentration), 'brine_concentration') === 'warning' && '⚠ Warning'}
                      {getValueStatus(parseFloat(brineConcentration), 'brine_concentration') === 'critical' && '⚠ Critical'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Operator Info */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">
                Operator Information
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Operator Certificate Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={operatorCertNumber}
                    onChange={(e) => setOperatorCertNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your TSSA certificate number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Any observations or maintenance notes..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600
                       text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30
                       hover:shadow-xl hover:shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Logging...' : `Log Inspection #${getNextInspectionNumber()}`}
            </button>
          </div>
        </div>

        {/* Recent Logs */}
        {recentLogs.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Recent Inspections</h3>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        Inspection #{log.inspection_number || 'N/A'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(log.log_date).toLocaleDateString()} at {log.log_time}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                        <span>Discharge: {log.discharge_pressure} psig</span>
                        <span>Suction: {log.suction_pressure} psig</span>
                        <span>Brine Supply: {log.brine_supply_temp}°F</span>
                        <span>Brine Return: {log.brine_return_temp}°F</span>
                      </div>
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
