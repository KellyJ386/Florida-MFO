'use client'

import { useState, useEffect } from 'react'
import type { MeasurementPoint, Measurement } from '@/lib/types/database'
import { calculateMeasurementStatus } from '@/lib/utils/measurements'
import { bluetoothService } from '@/lib/services/bluetooth'
import { Bluetooth, BluetoothOff, BluetoothSearching, CheckCircle, AlertCircle } from 'lucide-react'

interface MeasurementFormProps {
  point: MeasurementPoint
  onSubmit: (measurement: Measurement) => void
  onSkip?: () => void
  currentIndex: number
  totalPoints: number
}

export function MeasurementForm({
  point,
  onSubmit,
  onSkip,
  currentIndex,
  totalPoints,
}: MeasurementFormProps) {
  const [value, setValue] = useState('')
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [lastReading, setLastReading] = useState<number | null>(null)

  useEffect(() => {
    setIsBluetoothConnected(bluetoothService.isConnected())

    // Listen for Bluetooth measurements
    bluetoothService.onData((measuredValue) => {
      setValue(measuredValue.toFixed(2))
      setLastReading(measuredValue)
      // Show brief confirmation
      setTimeout(() => setLastReading(null), 2000)
    })
  }, [])

  const handleBluetoothConnect = async () => {
    setIsConnecting(true)
    try {
      await bluetoothService.connect()
      setIsBluetoothConnected(true)
    } catch (error) {
      console.error('Bluetooth connection failed:', error)
      alert('Failed to connect to Bluetooth device. Please ensure your caliper is on and try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleBluetoothDisconnect = async () => {
    await bluetoothService.disconnect()
    setIsBluetoothConnected(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numValue = parseFloat(value)

    if (isNaN(numValue) || numValue <= 0) {
      alert('Please enter a valid measurement')
      return
    }

    const status = calculateMeasurementStatus(
      numValue,
      point.targetDepth,
      point.tolerance
    )

    const measurement: Measurement = {
      pointId: point.id,
      value: numValue,
      status,
      timestamp: new Date().toISOString(),
    }

    onSubmit(measurement)
    setValue('')
    setLastReading(null)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-seahawks-green dark:text-seahawks-green-light mb-2">
          Point {currentIndex + 1} of {totalPoints}
        </div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{point.label}</h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400">Target:</span>
          <span className="font-semibold text-seahawks-navy dark:text-white">
            {point.targetDepth}" ± {point.tolerance}"
          </span>
        </div>
      </div>

      {/* Bluetooth Control - Enhanced */}
      <div className="mb-6">
        {isBluetoothConnected ? (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-50 to-emerald-50
                         dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200
                         dark:border-green-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bluetooth className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="font-semibold text-green-800 dark:text-green-300">
                    Bluetooth Connected
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Ready to receive measurements
                  </div>
                </div>
              </div>
              <button
                onClick={handleBluetoothDisconnect}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400
                         hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>

            {lastReading !== null && (
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800 flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Received: {lastReading.toFixed(2)}"</span>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleBluetoothConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold
                     bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                     text-white shadow-lg hover:shadow-xl transition-all duration-300
                     hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <BluetoothSearching className="w-5 h-5 animate-pulse" />
                <span>Connecting to Caliper...</span>
              </>
            ) : (
              <>
                <Bluetooth className="w-5 h-5" />
                <span>Connect Bluetooth Caliper</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Measurement Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="measurement" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Ice Depth Measurement (inches)
          </label>
          <input
            id="measurement"
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-6 py-4 text-3xl font-bold text-center
                     border-2 border-slate-300 dark:border-slate-600
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                     rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                     dark:focus:border-blue-400 transition-all"
            placeholder="0.00"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!value}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg
                     bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                     hover:from-seahawks-green-dark hover:to-green-800
                     text-white shadow-green hover:shadow-green-lg
                     transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <CheckCircle className="w-5 h-5" />
            Record Measurement
          </button>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-6 py-4 rounded-xl font-semibold
                       bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
                       hover:bg-slate-200 dark:hover:bg-slate-600
                       transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Skip
            </button>
          )}
        </div>
      </form>

      {/* Enhanced Tips */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-start gap-2 mb-3">
          <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Quick Tips:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-seahawks-green" />
                Connect Bluetooth caliper for automatic readings
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-seahawks-green" />
                Manual entry available when Bluetooth is disconnected
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-seahawks-green" />
                Skip points and return to them later
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
