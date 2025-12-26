'use client'

import React, { useState } from 'react'
import type { MeasurementPoint, Measurement } from '@/lib/types/database'
import { getStatusColor } from '@/lib/utils/measurements'

interface RinkDiagramProps {
  svgContent: string
  measurementPoints: MeasurementPoint[]
  measurements?: Measurement[]
  onPointClick?: (point: MeasurementPoint) => void
  highlightedPoint?: string
  editable?: boolean
}

export function RinkDiagram({
  svgContent,
  measurementPoints,
  measurements = [],
  onPointClick,
  highlightedPoint,
  editable = false,
}: RinkDiagramProps) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)

  const getMeasurementForPoint = (pointId: string): Measurement | undefined => {
    return measurements.find(m => m.pointId === pointId)
  }

  const getPointColor = (point: MeasurementPoint): string => {
    const measurement = getMeasurementForPoint(point.id)
    if (!measurement) return '#94a3b8' // gray for unmeasured
    return getStatusColor(measurement.status)
  }

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 800 400"
        className="w-full h-auto"
        style={{ maxHeight: '600px' }}
      >
        {/* Render the rink SVG */}
        <g dangerouslySetInnerHTML={{ __html: svgContent }} />

        {/* Render measurement points */}
        {measurementPoints.map((point) => {
          const measurement = getMeasurementForPoint(point.id)
          const isHighlighted = highlightedPoint === point.id
          const isHovered = hoveredPoint === point.id

          return (
            <g key={point.id}>
              {/* Point circle */}
              <circle
                cx={point.x}
                cy={point.y}
                r={isHighlighted ? 12 : isHovered ? 10 : 8}
                fill={getPointColor(point)}
                stroke={isHighlighted ? '#1e40af' : '#fff'}
                strokeWidth={isHighlighted ? 3 : 2}
                className={editable || onPointClick ? 'cursor-pointer' : ''}
                onClick={() => onPointClick?.(point)}
                onMouseEnter={() => setHoveredPoint(point.id)}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* Point label */}
              <text
                x={point.x}
                y={point.y - 15}
                textAnchor="middle"
                className="text-xs font-semibold fill-gray-700 pointer-events-none"
              >
                {point.label}
              </text>

              {/* Measurement value */}
              {measurement && (
                <text
                  x={point.x}
                  y={point.y + 25}
                  textAnchor="middle"
                  className="text-xs font-medium fill-gray-900 pointer-events-none"
                >
                  {measurement.value.toFixed(2)}"
                </text>
              )}

              {/* Hover tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={point.x - 60}
                    y={point.y - 60}
                    width="120"
                    height="40"
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    rx="4"
                    className="pointer-events-none"
                  />
                  <text
                    x={point.x}
                    y={point.y - 45}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-900 pointer-events-none"
                  >
                    {point.label}
                  </text>
                  <text
                    x={point.x}
                    y={point.y - 30}
                    textAnchor="middle"
                    className="text-xs fill-gray-600 pointer-events-none"
                  >
                    Target: {point.targetDepth}"
                  </text>
                  {measurement && (
                    <text
                      x={point.x}
                      y={point.y - 15}
                      textAnchor="middle"
                      className="text-xs fill-gray-600 pointer-events-none"
                    >
                      Actual: {measurement.value.toFixed(2)}"
                    </text>
                  )}
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-ice-ideal" />
          <span>Ideal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-ice-warning" />
          <span>Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-ice-critical" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-400" />
          <span>Not Measured</span>
        </div>
      </div>
    </div>
  )
}
