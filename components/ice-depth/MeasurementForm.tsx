'use client'

import { useState, useEffect } from 'react'
import type { MeasurementPoint, Measurement } from '@/lib/types/database'
import { calculateMeasurementStatus } from '@/lib/utils/measurements'
import { bluetoothService } from '@/lib/services/bluetooth'
import { Bluetooth, BluetoothOff } from 'lucide-react'

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

  useEffect(() => {
    setIsBluetoothConnected(bluetoothService.isConnected())

    // Listen for Bluetooth measurements
    bluetoothService.onData((measuredValue) => {
      setValue(measuredValue.toFixed(2))
    })
  }, [])

  const handleBluetoothConnect = async () => {
    setIsConnecting(true)
    try {
      await bluetoothService.connect()
      setIsBluetoothConnected(true)
    } catch (error) {
      console.error('Bluetooth connection failed:', error)
      alert('Failed to connect to Bluetooth device. Please try again.')
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
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">
          Point {currentIndex + 1} of {totalPoints}
        </div>
        <h3 className="text-2xl font-bold">{point.label}</h3>
        <p className="text-gray-600 mt-1">
          Target: {point.targetDepth}" ± {point.tolerance}"
        </p>
      </div>

      {/* Bluetooth Control */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        {isBluetoothConnected ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600">
              <Bluetooth className="w-5 h-5" />
              <span className="text-sm font-medium">Bluetooth Connected</span>
            </div>
            <button
              onClick={handleBluetoothDisconnect}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleBluetoothConnect}
            disabled={isConnecting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <BluetoothOff className="w-5 h-5" />
            {isConnecting ? 'Connecting...' : 'Connect Bluetooth Caliper'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="measurement" className="block text-sm font-medium text-gray-700 mb-2">
            Measurement (inches)
          </label>
          <input
            id="measurement"
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-4 py-3 text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Record Measurement
          </button>
          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </form>

      {/* Quick actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Quick Tips:</p>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Connect Bluetooth caliper for automatic readings</li>
          <li>• Measurements are saved automatically</li>
          <li>• You can skip points and return later</li>
        </ul>
      </div>
    </div>
  )
}
