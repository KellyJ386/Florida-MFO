export class BluetoothCaliperService {
  private device: BluetoothDevice | null = null
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null
  private onDataCallback: ((value: number) => void) | null = null

  async connect(): Promise<void> {
    try {
      // Request Bluetooth device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['battery_service'] },
          { name: 'Digital Caliper' }
        ],
        optionalServices: ['00001234-0000-1000-8000-00805f9b34fb']
      })

      if (!this.device.gatt) {
        throw new Error('GATT not supported')
      }

      const server = await this.device.gatt.connect()
      const service = await server.getPrimaryService('00001234-0000-1000-8000-00805f9b34fb')
      this.characteristic = await service.getCharacteristic('00001235-0000-1000-8000-00805f9b34fb')

      // Start notifications
      await this.characteristic.startNotifications()
      this.characteristic.addEventListener('characteristicvaluechanged', this.handleDataReceived.bind(this))
    } catch (error) {
      console.error('Bluetooth connection error:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.device && this.device.gatt) {
      await this.device.gatt.disconnect()
      this.device = null
      this.characteristic = null
    }
  }

  private handleDataReceived(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic
    const value = target.value

    if (value) {
      // Parse the measurement value (format depends on specific caliper)
      const measurement = this.parseValue(value)
      if (this.onDataCallback) {
        this.onDataCallback(measurement)
      }
    }
  }

  private parseValue(dataView: DataView): number {
    // This is a simplified parser - actual implementation depends on caliper protocol
    // Most digital calipers send data in a specific format
    const rawValue = dataView.getUint16(0, true)
    return rawValue / 100 // Convert to inches
  }

  onData(callback: (value: number) => void): void {
    this.onDataCallback = callback
  }

  isConnected(): boolean {
    return this.device?.gatt?.connected || false
  }
}

export const bluetoothService = new BluetoothCaliperService()
