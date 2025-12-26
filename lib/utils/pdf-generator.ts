import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import type { Measurement, MeasurementPoint } from '@/lib/types/database'
import { getIssueCount, calculateAverageDepth, formatDepth } from './measurements'

export async function generateIceDepthPDF(
  templateName: string,
  measurementDate: string,
  measurements: Measurement[],
  measurementPoints: MeasurementPoint[],
  notes?: string,
  recordedBy?: string
) {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  // Header
  pdf.setFontSize(20)
  pdf.text('Ice Depth Measurement Report', pageWidth / 2, 20, { align: 'center' })

  // Report info
  pdf.setFontSize(12)
  pdf.text(`Rink: ${templateName}`, 20, 35)
  pdf.text(`Date: ${new Date(measurementDate).toLocaleDateString()}`, 20, 42)
  if (recordedBy) {
    pdf.text(`Recorded by: ${recordedBy}`, 20, 49)
  }

  // Summary statistics
  const issueCount = getIssueCount(measurements)
  const avgDepth = calculateAverageDepth(measurements)

  pdf.setFontSize(14)
  pdf.text('Summary', 20, 62)
  pdf.setFontSize(11)
  pdf.text(`Total Points: ${measurementPoints.length}`, 25, 70)
  pdf.text(`Measured: ${measurements.length}`, 25, 77)
  pdf.text(`Average Depth: ${formatDepth(avgDepth)}`, 25, 84)

  // Status breakdown
  pdf.setFillColor(34, 197, 94) // green
  pdf.rect(25, 92, 10, 5, 'F')
  pdf.text(`Ideal: ${issueCount.ideal}`, 38, 96)

  pdf.setFillColor(234, 179, 8) // yellow
  pdf.rect(25, 100, 10, 5, 'F')
  pdf.text(`Warning: ${issueCount.warning}`, 38, 104)

  pdf.setFillColor(239, 68, 68) // red
  pdf.rect(25, 108, 10, 5, 'F')
  pdf.text(`Critical: ${issueCount.critical}`, 38, 112)

  // Measurements table
  let yPos = 125
  pdf.setFontSize(14)
  pdf.text('Measurements', 20, yPos)
  yPos += 10

  pdf.setFontSize(10)
  pdf.setFillColor(240, 240, 240)
  pdf.rect(20, yPos - 5, pageWidth - 40, 8, 'F')
  pdf.text('Point', 25, yPos)
  pdf.text('Target', 80, yPos)
  pdf.text('Actual', 110, yPos)
  pdf.text('Status', 140, yPos)
  yPos += 10

  measurements.forEach((measurement) => {
    const point = measurementPoints.find(p => p.id === measurement.pointId)
    if (!point) return

    if (yPos > pageHeight - 30) {
      pdf.addPage()
      yPos = 20
    }

    pdf.text(point.label, 25, yPos)
    pdf.text(`${formatDepth(point.targetDepth)}`, 80, yPos)
    pdf.text(`${formatDepth(measurement.value)}`, 110, yPos)

    // Status indicator
    const statusColor = measurement.status === 'ideal'
      ? [34, 197, 94]
      : measurement.status === 'warning'
      ? [234, 179, 8]
      : [239, 68, 68]

    pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2])
    pdf.circle(145, yPos - 1.5, 2, 'F')
    pdf.setTextColor(0, 0, 0)
    pdf.text(measurement.status.toUpperCase(), 150, yPos)

    yPos += 7
  })

  // Notes
  if (notes) {
    yPos += 10
    if (yPos > pageHeight - 40) {
      pdf.addPage()
      yPos = 20
    }

    pdf.setFontSize(14)
    pdf.text('Notes', 20, yPos)
    yPos += 7

    pdf.setFontSize(10)
    const splitNotes = pdf.splitTextToSize(notes, pageWidth - 40)
    pdf.text(splitNotes, 20, yPos)
  }

  // Footer
  const timestamp = new Date().toLocaleString()
  pdf.setFontSize(8)
  pdf.setTextColor(128, 128, 128)
  pdf.text(`Generated: ${timestamp}`, pageWidth / 2, pageHeight - 10, { align: 'center' })

  return pdf
}

export async function downloadPDF(pdf: jsPDF, filename: string) {
  pdf.save(filename)
}

export async function getPDFBlob(pdf: jsPDF): Promise<Blob> {
  return pdf.output('blob')
}
