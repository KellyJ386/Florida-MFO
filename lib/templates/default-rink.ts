import type { MeasurementPoint } from '@/lib/types/database'

// Default hockey rink SVG (200' x 85')
export const DEFAULT_RINK_SVG = `
<rect x="50" y="50" width="700" height="300" fill="#E3F2FD" stroke="#1976D2" stroke-width="4" rx="15"/>
<circle cx="400" cy="200" r="30" fill="none" stroke="#1976D2" stroke-width="2"/>
<line x1="275" y1="50" x2="275" y2="350" stroke="#EF5350" stroke-width="3"/>
<line x1="525" y1="50" x2="525" y2="350" stroke="#1565C0" stroke-width="3"/>
<line x1="400" y1="50" x2="400" y2="350" stroke="#EF5350" stroke-width="2" stroke-dasharray="10,5"/>
<circle cx="150" cy="200" r="15" fill="none" stroke="#EF5350" stroke-width="2"/>
<circle cx="650" cy="200" r="15" fill="none" stroke="#1565C0" stroke-width="2"/>
`

// Standard 13-point measurement grid for hockey rink
export const DEFAULT_MEASUREMENT_POINTS: MeasurementPoint[] = [
  // Center ice
  { id: '1', x: 400, y: 200, label: 'C1', targetDepth: 0.75, tolerance: 0.125 },

  // Neutral zone
  { id: '2', x: 300, y: 125, label: 'N1', targetDepth: 0.75, tolerance: 0.125 },
  { id: '3', x: 300, y: 275, label: 'N2', targetDepth: 0.75, tolerance: 0.125 },
  { id: '4', x: 500, y: 125, label: 'N3', targetDepth: 0.75, tolerance: 0.125 },
  { id: '5', x: 500, y: 275, label: 'N4', targetDepth: 0.75, tolerance: 0.125 },

  // Defensive zone (left)
  { id: '6', x: 150, y: 125, label: 'D1', targetDepth: 0.75, tolerance: 0.125 },
  { id: '7', x: 150, y: 200, label: 'D2', targetDepth: 0.75, tolerance: 0.125 },
  { id: '8', x: 150, y: 275, label: 'D3', targetDepth: 0.75, tolerance: 0.125 },

  // Defensive zone (right)
  { id: '9', x: 650, y: 125, label: 'D4', targetDepth: 0.75, tolerance: 0.125 },
  { id: '10', x: 650, y: 200, label: 'D5', targetDepth: 0.75, tolerance: 0.125 },
  { id: '11', x: 650, y: 275, label: 'D6', targetDepth: 0.75, tolerance: 0.125 },

  // Corners
  { id: '12', x: 100, y: 100, label: 'CR1', targetDepth: 0.75, tolerance: 0.125 },
  { id: '13', x: 700, y: 100, label: 'CR2', targetDepth: 0.75, tolerance: 0.125 },
]

export function getDefaultTemplate() {
  return {
    name: 'Standard Hockey Rink',
    rink_svg: DEFAULT_RINK_SVG,
    measurement_points: DEFAULT_MEASUREMENT_POINTS,
  }
}
