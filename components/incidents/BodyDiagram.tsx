'use client'

import { useState } from 'react'

type BodyRegion =
  | 'head'
  | 'neck'
  | 'upper_body'
  | 'lower_body'
  | 'left_arm'
  | 'right_arm'
  | 'left_leg'
  | 'right_leg'

interface BodyDiagramProps {
  selectedRegions: string[]
  onRegionToggle: (region: string) => void
  disabled?: boolean
}

export function BodyDiagram({ selectedRegions, onRegionToggle, disabled = false }: BodyDiagramProps) {
  const [view, setView] = useState<'front' | 'back'>('front')

  const isSelected = (region: string) => selectedRegions.includes(region)

  const getRegionColor = (region: string) => {
    if (disabled) {
      return isSelected(region)
        ? 'fill-red-400/60 dark:fill-red-600/60'
        : 'fill-slate-200 dark:fill-slate-700'
    }
    return isSelected(region)
      ? 'fill-red-500 dark:fill-red-600 hover:fill-red-600 dark:hover:fill-red-700'
      : 'fill-blue-100 dark:fill-blue-900/30 hover:fill-blue-200 dark:hover:fill-blue-900/50'
  }

  const getRegionStroke = (region: string) => {
    return isSelected(region)
      ? 'stroke-red-700 dark:stroke-red-400'
      : 'stroke-slate-400 dark:stroke-slate-600'
  }

  const handleRegionClick = (region: string) => {
    if (!disabled) {
      onRegionToggle(region)
    }
  }

  const regionLabels: Record<string, string> = {
    head: 'Head',
    neck: 'Neck',
    upper_body: 'Upper Body',
    lower_body: 'Lower Body',
    left_arm: 'Left Arm',
    right_arm: 'Right Arm',
    left_leg: 'Left Leg',
    right_leg: 'Right Leg',
  }

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setView('front')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            view === 'front'
              ? 'bg-seahawks-navy dark:bg-seahawks-green text-white dark:text-seahawks-navy'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Front View
        </button>
        <button
          type="button"
          onClick={() => setView('back')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            view === 'back'
              ? 'bg-seahawks-navy dark:bg-seahawks-green text-white dark:text-seahawks-navy'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Back View
        </button>
      </div>

      {/* SVG Body Diagram */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-8">
        <div className="max-w-md mx-auto">
          {view === 'front' ? (
            // Front View SVG
            <svg viewBox="0 0 200 400" className="w-full h-auto">
              {/* Head */}
              <ellipse
                cx="100"
                cy="30"
                rx="25"
                ry="30"
                className={`${getRegionColor('head')} ${getRegionStroke('head')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('head')}
              />
              <text x="100" y="35" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Head
              </text>

              {/* Neck */}
              <rect
                x="85"
                y="60"
                width="30"
                height="20"
                className={`${getRegionColor('neck')} ${getRegionStroke('neck')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('neck')}
              />
              <text x="100" y="73" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Neck
              </text>

              {/* Upper Body (Chest/Shoulders) */}
              <path
                d="M 60 80 L 140 80 L 135 150 L 65 150 Z"
                className={`${getRegionColor('upper_body')} ${getRegionStroke('upper_body')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('upper_body')}
              />
              <text x="100" y="115" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Upper
              </text>
              <text x="100" y="127" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Body
              </text>

              {/* Lower Body (Abdomen/Hips) */}
              <path
                d="M 65 150 L 135 150 L 130 210 L 70 210 Z"
                className={`${getRegionColor('lower_body')} ${getRegionStroke('lower_body')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('lower_body')}
              />
              <text x="100" y="177" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Lower
              </text>
              <text x="100" y="189" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Body
              </text>

              {/* Right Arm (viewer's right, person's left) */}
              <path
                d="M 60 85 L 30 90 L 25 180 L 35 185 L 40 95 Z"
                className={`${getRegionColor('right_arm')} ${getRegionStroke('right_arm')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('right_arm')}
              />
              <text x="32" y="135" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                R
              </text>

              {/* Left Arm (viewer's left, person's right) */}
              <path
                d="M 140 85 L 170 90 L 175 180 L 165 185 L 160 95 Z"
                className={`${getRegionColor('left_arm')} ${getRegionStroke('left_arm')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('left_arm')}
              />
              <text x="168" y="135" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                L
              </text>

              {/* Right Leg (viewer's right, person's left) */}
              <path
                d="M 70 210 L 85 210 L 82 370 L 65 370 Z"
                className={`${getRegionColor('right_leg')} ${getRegionStroke('right_leg')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('right_leg')}
              />
              <text x="76" y="290" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                R
              </text>

              {/* Left Leg (viewer's left, person's right) */}
              <path
                d="M 115 210 L 130 210 L 135 370 L 118 370 Z"
                className={`${getRegionColor('left_leg')} ${getRegionStroke('left_leg')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('left_leg')}
              />
              <text x="124" y="290" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                L
              </text>
            </svg>
          ) : (
            // Back View SVG
            <svg viewBox="0 0 200 400" className="w-full h-auto">
              {/* Head */}
              <ellipse
                cx="100"
                cy="30"
                rx="25"
                ry="30"
                className={`${getRegionColor('head')} ${getRegionStroke('head')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('head')}
              />
              <text x="100" y="35" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Head
              </text>

              {/* Neck */}
              <rect
                x="85"
                y="60"
                width="30"
                height="20"
                className={`${getRegionColor('neck')} ${getRegionStroke('neck')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('neck')}
              />
              <text x="100" y="73" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Neck
              </text>

              {/* Upper Body (Back/Shoulders) */}
              <path
                d="M 60 80 L 140 80 L 135 150 L 65 150 Z"
                className={`${getRegionColor('upper_body')} ${getRegionStroke('upper_body')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('upper_body')}
              />
              <text x="100" y="115" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Upper
              </text>
              <text x="100" y="127" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Back
              </text>

              {/* Lower Body (Lower Back/Buttocks) */}
              <path
                d="M 65 150 L 135 150 L 130 210 L 70 210 Z"
                className={`${getRegionColor('lower_body')} ${getRegionStroke('lower_body')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('lower_body')}
              />
              <text x="100" y="177" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Lower
              </text>
              <text x="100" y="189" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                Back
              </text>

              {/* Right Arm (viewer's right, person's left) */}
              <path
                d="M 60 85 L 30 90 L 25 180 L 35 185 L 40 95 Z"
                className={`${getRegionColor('right_arm')} ${getRegionStroke('right_arm')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('right_arm')}
              />
              <text x="32" y="135" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                R
              </text>

              {/* Left Arm (viewer's left, person's right) */}
              <path
                d="M 140 85 L 170 90 L 175 180 L 165 185 L 160 95 Z"
                className={`${getRegionColor('left_arm')} ${getRegionStroke('left_arm')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('left_arm')}
              />
              <text x="168" y="135" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                L
              </text>

              {/* Right Leg (viewer's right, person's left) */}
              <path
                d="M 70 210 L 85 210 L 82 370 L 65 370 Z"
                className={`${getRegionColor('right_leg')} ${getRegionStroke('right_leg')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('right_leg')}
              />
              <text x="76" y="290" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                R
              </text>

              {/* Left Leg (viewer's left, person's right) */}
              <path
                d="M 115 210 L 130 210 L 135 370 L 118 370 Z"
                className={`${getRegionColor('left_leg')} ${getRegionStroke('left_leg')} cursor-pointer transition-all`}
                strokeWidth="2"
                onClick={() => handleRegionClick('left_leg')}
              />
              <text x="124" y="290" textAnchor="middle" className="fill-slate-700 dark:fill-slate-300 text-xs pointer-events-none">
                L
              </text>
            </svg>
          )}
        </div>

        {/* Instructions */}
        {!disabled && (
          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Click on body regions to select injury locations. Selected regions will turn red.
          </div>
        )}
      </div>

      {/* Selected Regions Summary */}
      {selectedRegions.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Selected Injury Locations ({selectedRegions.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRegions.map((region) => (
              <span
                key={region}
                className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300
                           rounded-full text-xs font-semibold border border-red-300 dark:border-red-700
                           flex items-center gap-2"
              >
                {regionLabels[region]}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRegionClick(region)}
                    className="hover:text-red-600 dark:hover:text-red-200 transition-colors"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
