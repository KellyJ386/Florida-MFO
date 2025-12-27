'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Snowflake, Home, Wrench, ClipboardCheck, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { IceMakeLogForm } from '@/components/ice-operations/IceMakeLogForm'
import { BladeChangeLogForm } from '@/components/ice-operations/BladeChangeLogForm'
import { CircleCheckForm } from '@/components/ice-operations/CircleCheckForm'
import { EndOfDayReport } from '@/components/ice-operations/EndOfDayReport'

export default function IceOperationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'ice-make' | 'blade-change' | 'circle-check' | 'end-of-day'>('ice-make')

  const tabs = [
    {
      id: 'ice-make' as const,
      label: 'Ice Make Log',
      icon: Snowflake,
      description: 'Track ice resurfacing operations',
    },
    {
      id: 'blade-change' as const,
      label: 'Blade Change Log',
      icon: Wrench,
      description: 'Log blade changes with 7-day alerts',
    },
    {
      id: 'circle-check' as const,
      label: 'Circle Check',
      icon: ClipboardCheck,
      description: '30-point pre-operation inspection',
    },
    {
      id: 'end-of-day' as const,
      label: 'End of Day Report',
      icon: FileText,
      description: 'Daily summary and observations',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100
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

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
              <Snowflake className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-blue-600
                             dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                Ice Operations
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Comprehensive ice resurfacing and maintenance tracking
              </p>
            </div>
          </div>
        </div>

        {/* Active Blade Change Alerts */}
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2">⚠️ FRESH BLADE ALERT - Zamboni #1</h3>
              <p className="text-white/90 mb-1">Blade changed on Dec 26, 2025 at 8:30 AM by John Smith</p>
              <p className="text-sm text-white/80">Exercise caution on first few cuts - fresh blade! (Expires in 5 days)</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative p-6 transition-all border-b-4 ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400'
                      : 'bg-white dark:bg-slate-800 border-transparent hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon
                      className={`w-8 h-8 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                    <div className="text-center">
                      <div
                        className={`font-semibold text-sm md:text-base ${
                          isActive
                            ? 'text-blue-900 dark:text-blue-200'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {tab.label}
                      </div>
                      <div
                        className={`text-xs mt-1 hidden md:block ${
                          isActive
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-slate-500 dark:text-slate-500'
                        }`}
                      >
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
          {activeTab === 'ice-make' && <IceMakeLogForm />}

          {activeTab === 'blade-change' && <BladeChangeLogForm />}

          {activeTab === 'circle-check' && <CircleCheckForm />}

          {activeTab === 'end-of-day' && <EndOfDayReport />}
        </div>
      </div>
    </div>
  )
}
