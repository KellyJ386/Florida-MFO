'use client'

import { useState } from 'react'
import type { MeasurementPoint } from '@/lib/types/database'
import { Plus, Trash2, Edit2 } from 'lucide-react'

interface TemplateEditorProps {
  svgContent: string
  onSvgChange: (svg: string) => void
  measurementPoints: MeasurementPoint[]
  onPointsChange: (points: MeasurementPoint[]) => void
}

export function TemplateEditor({
  svgContent,
  onSvgChange,
  measurementPoints,
  onPointsChange,
}: TemplateEditorProps) {
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null)
  const [isAddingPoint, setIsAddingPoint] = useState(false)
  const [editingPoint, setEditingPoint] = useState<MeasurementPoint | null>(null)

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isAddingPoint) return

    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 800
    const y = ((e.clientY - rect.top) / rect.height) * 400

    const newPoint: MeasurementPoint = {
      id: `point-${Date.now()}`,
      x: Math.round(x),
      y: Math.round(y),
      label: `P${measurementPoints.length + 1}`,
      targetDepth: 0.75,
      tolerance: 0.125,
    }

    onPointsChange([...measurementPoints, newPoint])
    setIsAddingPoint(false)
    setEditingPoint(newPoint)
  }

  const handleUpdatePoint = (updatedPoint: MeasurementPoint) => {
    onPointsChange(
      measurementPoints.map(p => p.id === updatedPoint.id ? updatedPoint : p)
    )
    setEditingPoint(null)
  }

  const handleDeletePoint = (id: string) => {
    if (confirm('Delete this measurement point?')) {
      onPointsChange(measurementPoints.filter(p => p.id !== id))
      if (selectedPoint === id) setSelectedPoint(null)
      if (editingPoint?.id === id) setEditingPoint(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* SVG Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rink SVG Diagram
        </label>
        <textarea
          value={svgContent}
          onChange={(e) => onSvgChange(e.target.value)}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter SVG content..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Paste SVG code or use the default template
        </p>
      </div>

      {/* Interactive Diagram */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Measurement Points
          </label>
          <button
            onClick={() => setIsAddingPoint(!isAddingPoint)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${
              isAddingPoint
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            {isAddingPoint ? 'Click on diagram to add' : 'Add Point'}
          </button>
        </div>

        <div className={`border-2 rounded-lg p-4 bg-gray-50 ${
          isAddingPoint ? 'border-blue-500' : 'border-gray-300'
        }`}>
          <svg
            viewBox="0 0 800 400"
            className="w-full cursor-crosshair"
            onClick={handleSvgClick}
          >
            {/* Render SVG */}
            <g dangerouslySetInnerHTML={{ __html: svgContent }} />

            {/* Render measurement points */}
            {measurementPoints.map((point) => (
              <g key={point.id}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={selectedPoint === point.id ? 12 : 8}
                  fill={selectedPoint === point.id ? '#3b82f6' : '#6b7280'}
                  stroke="#fff"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPoint(point.id)
                  }}
                />
                <text
                  x={point.x}
                  y={point.y - 15}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-gray-700 pointer-events-none"
                >
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {isAddingPoint && (
          <p className="mt-2 text-sm text-blue-600">
            Click anywhere on the diagram to place a measurement point
          </p>
        )}
      </div>

      {/* Point List */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Points ({measurementPoints.length})
        </h3>
        {measurementPoints.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            No measurement points added yet. Click "Add Point" to start.
          </p>
        ) : (
          <div className="space-y-2">
            {measurementPoints.map((point) => (
              <div
                key={point.id}
                className={`p-3 border rounded-lg ${
                  selectedPoint === point.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {editingPoint?.id === point.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Label</label>
                        <input
                          type="text"
                          value={editingPoint.label}
                          onChange={(e) => setEditingPoint({ ...editingPoint, label: e.target.value })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Target Depth (in)</label>
                        <input
                          type="number"
                          step="0.125"
                          value={editingPoint.targetDepth}
                          onChange={(e) => setEditingPoint({ ...editingPoint, targetDepth: parseFloat(e.target.value) })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Tolerance (±in)</label>
                      <input
                        type="number"
                        step="0.125"
                        value={editingPoint.tolerance}
                        onChange={(e) => setEditingPoint({ ...editingPoint, tolerance: parseFloat(e.target.value) })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdatePoint(editingPoint)}
                        className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPoint(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-sm">{point.label}</div>
                      <div className="text-xs text-gray-600">
                        Position: ({point.x}, {point.y}) |
                        Target: {point.targetDepth}" ± {point.tolerance}"
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingPoint(point)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePoint(point.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
