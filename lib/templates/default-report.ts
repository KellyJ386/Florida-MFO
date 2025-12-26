import type { ReportTab } from '@/lib/types/database'

// Default daily report template with common tabs
export const DEFAULT_REPORT_TABS: ReportTab[] = [
  {
    id: 'general',
    title: 'General',
    fields: [
      {
        id: 'shift_start',
        type: 'time',
        label: 'Shift Start Time',
        required: true,
      },
      {
        id: 'shift_end',
        type: 'time',
        label: 'Shift End Time',
        required: true,
      },
      {
        id: 'staff_present',
        type: 'text',
        label: 'Staff Present',
        required: true,
      },
      {
        id: 'weather',
        type: 'select',
        label: 'Weather Conditions',
        required: true,
        options: ['Clear', 'Cloudy', 'Rain', 'Snow', 'Extreme Cold', 'Extreme Heat'],
      },
    ],
  },
  {
    id: 'ice_maintenance',
    title: 'Ice Maintenance',
    fields: [
      {
        id: 'resurface_count',
        type: 'number',
        label: 'Number of Resurfacing',
        required: true,
      },
      {
        id: 'ice_temperature',
        type: 'number',
        label: 'Ice Temperature (°F)',
        required: true,
      },
      {
        id: 'water_temperature',
        type: 'number',
        label: 'Water Temperature (°F)',
        required: true,
      },
      {
        id: 'ice_quality',
        type: 'select',
        label: 'Ice Quality',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
      },
      {
        id: 'ice_issues',
        type: 'textarea',
        label: 'Ice Issues or Notes',
        required: false,
      },
    ],
  },
  {
    id: 'equipment',
    title: 'Equipment',
    fields: [
      {
        id: 'zamboni_check',
        type: 'checkbox',
        label: 'Zamboni Pre-Operation Check Completed',
        required: true,
      },
      {
        id: 'equipment_issues',
        type: 'textarea',
        label: 'Equipment Issues or Repairs Needed',
        required: false,
      },
      {
        id: 'maintenance_performed',
        type: 'textarea',
        label: 'Maintenance Performed',
        required: false,
      },
    ],
  },
  {
    id: 'facility',
    title: 'Facility',
    fields: [
      {
        id: 'facility_clean',
        type: 'checkbox',
        label: 'Facility Cleaning Completed',
        required: true,
      },
      {
        id: 'hvac_check',
        type: 'checkbox',
        label: 'HVAC Systems Check',
        required: true,
      },
      {
        id: 'safety_check',
        type: 'checkbox',
        label: 'Safety Equipment Check',
        required: true,
      },
      {
        id: 'facility_issues',
        type: 'textarea',
        label: 'Facility Issues or Concerns',
        required: false,
      },
    ],
  },
  {
    id: 'incidents',
    title: 'Incidents',
    fields: [
      {
        id: 'incidents_occurred',
        type: 'checkbox',
        label: 'Any Incidents Occurred',
        required: false,
      },
      {
        id: 'incident_details',
        type: 'textarea',
        label: 'Incident Details',
        required: false,
      },
      {
        id: 'action_taken',
        type: 'textarea',
        label: 'Action Taken',
        required: false,
      },
    ],
  },
  {
    id: 'notes',
    title: 'Additional Notes',
    fields: [
      {
        id: 'additional_notes',
        type: 'textarea',
        label: 'Additional Notes or Comments',
        required: false,
      },
      {
        id: 'next_shift_notes',
        type: 'textarea',
        label: 'Notes for Next Shift',
        required: false,
      },
    ],
  },
]

export function getDefaultReportTemplate() {
  return {
    name: 'Standard Daily Report',
    tabs: DEFAULT_REPORT_TABS,
  }
}
