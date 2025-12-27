'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  Home, Save, Settings as SettingsIcon, Bell, Shield, Palette,
  Globe, Clock, Mail, Lock, Eye, EyeOff, Smartphone
} from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'appearance'>('general')

  const [settings, setSettings] = useState({
    // General
    facilityName: 'Ice Rink Facility',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',

    // Notifications
    emailNotifications: true,
    iceDepthAlerts: true,
    scheduleReminders: true,
    reportReminders: true,
    alertThreshold: 0.5,

    // Security
    sessionTimeout: 30,
    requireStrongPassword: true,
    twoFactorAuth: false,

    // Appearance
    defaultTheme: 'light' as 'light' | 'dark' | 'system',
    compactMode: false
  })

  const { isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin')
      return
    }
  }, [isAdmin])

  const handleSave = async () => {
    setSaving(true)
    try {
      // In production, save to database
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'general' as const, label: 'General', icon: SettingsIcon },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200
                     dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800
                         hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Admin Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-seahawks-grey-dark to-seahawks-grey shadow-lg">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-seahawks-grey-dark
                             dark:from-white dark:to-seahawks-grey-light bg-clip-text text-transparent">
                System Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Configure application preferences and behavior
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-seahawks-green to-seahawks-green-dark text-white shadow-green'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 shadow-lg">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Facility Name
                </label>
                <input
                  type="text"
                  value={settings.facilityName}
                  onChange={(e) => setSettings({ ...settings, facilityName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                             transition-all"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                               transition-all"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Time Format
                  </label>
                  <select
                    value={settings.timeFormat}
                    onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                               rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                               transition-all"
                  >
                    <option value="12h">12-hour (3:30 PM)</option>
                    <option value="24h">24-hour (15:30)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                             transition-all"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/27/2025)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (27/12/2025)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-27)</option>
                </select>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Email Notifications</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Receive email alerts for important events</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 dark:bg-slate-600 peer-focus:ring-4 peer-focus:ring-seahawks-green/20
                                 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white
                                 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white
                                 after:rounded-full after:h-6 after:w-6 after:transition-all
                                 peer-checked:bg-seahawks-green"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Ice Depth Alerts</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Get notified when ice depth is out of range</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.iceDepthAlerts}
                    onChange={(e) => setSettings({ ...settings, iceDepthAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 dark:bg-slate-600 peer-focus:ring-4 peer-focus:ring-seahawks-green/20
                                 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white
                                 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white
                                 after:rounded-full after:h-6 after:w-6 after:transition-all
                                 peer-checked:bg-seahawks-green"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Schedule Reminders</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Remind staff of upcoming shifts</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.scheduleReminders}
                    onChange={(e) => setSettings({ ...settings, scheduleReminders: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 dark:bg-slate-600 peer-focus:ring-4 peer-focus:ring-seahawks-green/20
                                 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white
                                 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white
                                 after:rounded-full after:h-6 after:w-6 after:transition-all
                                 peer-checked:bg-seahawks-green"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Alert Threshold (inches)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.alertThreshold}
                  onChange={(e) => setSettings({ ...settings, alertThreshold: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                             transition-all"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Alert when ice depth deviates by this amount from target
                </p>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Session Timeout (minutes)
                </label>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             rounded-xl focus:ring-4 focus:ring-seahawks-green/20 focus:border-seahawks-green
                             transition-all"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Require Strong Passwords</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Enforce password complexity requirements</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireStrongPassword}
                    onChange={(e) => setSettings({ ...settings, requireStrongPassword: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 dark:bg-slate-600 peer-focus:ring-4 peer-focus:ring-seahawks-green/20
                                 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white
                                 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white
                                 after:rounded-full after:h-6 after:w-6 after:transition-all
                                 peer-checked:bg-seahawks-green"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Two-Factor Authentication</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Add an extra layer of security</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 dark:bg-slate-600 peer-focus:ring-4 peer-focus:ring-seahawks-green/20
                                 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white
                                 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white
                                 after:rounded-full after:h-6 after:w-6 after:transition-all
                                 peer-checked:bg-seahawks-green"></div>
                </label>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Security Best Practices</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Change passwords regularly (every 90 days)</li>
                  <li>• Use unique passwords for different accounts</li>
                  <li>• Enable two-factor authentication for admins</li>
                  <li>• Review user access permissions quarterly</li>
                </ul>
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  <Palette className="w-4 h-4 inline mr-2" />
                  Default Theme
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(['light', 'dark', 'system'] as const).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setSettings({ ...settings, defaultTheme: theme })}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        settings.defaultTheme === theme
                          ? 'border-seahawks-green bg-seahawks-green/10'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">
                          {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '⚙️'}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-white capitalize">{theme}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Compact Mode</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Use smaller spacing and fonts</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => setSettings({ ...settings, compactMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-slate-300 dark:bg-slate-600 peer-focus:ring-4 peer-focus:ring-seahawks-green/20
                                 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white
                                 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white
                                 after:rounded-full after:h-6 after:w-6 after:transition-all
                                 peer-checked:bg-seahawks-green"></div>
                </label>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
                <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">Seahawks Color Scheme</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="w-full h-16 bg-seahawks-navy rounded-lg mb-2"></div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Navy</div>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-16 bg-seahawks-green rounded-lg mb-2"></div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Action Green</div>
                  </div>
                  <div className="text-center">
                    <div className="w-full h-16 bg-seahawks-grey rounded-lg mb-2"></div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Wolf Grey</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-seahawks-green to-seahawks-green-dark
                       text-white rounded-xl font-bold text-lg shadow-green hover:shadow-green-lg
                       transition-all duration-300 hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
