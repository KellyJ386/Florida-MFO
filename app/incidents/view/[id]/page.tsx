'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, Home, Edit, Clock, Lock, CheckCircle2, FileText } from 'lucide-react'
import Link from 'next/link'
import { BodyDiagram } from '@/components/incidents/BodyDiagram'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import type { Database } from '@/lib/types/database'

type Incident = Database['public']['Tables']['incidents']['Row']

export default function ViewIncidentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [reporterProfile, setReporterProfile] = useState<any>(null)

  useEffect(() => {
    fetchIncident()
  }, [params.id])

  const fetchIncident = async () => {
    try {
      const { data: incidentData, error: incidentError } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', params.id)
        .single()

      if (incidentError) throw incidentError
      setIncident(incidentData)

      // Fetch reporter profile
      if (incidentData.reported_by) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', incidentData.reported_by)
          .single()

        setReporterProfile(profileData)
      }
    } catch (error) {
      console.error('Error fetching incident:', error)
      alert('Error loading incident')
      router.push('/incidents')
    } finally {
      setLoading(false)
    }
  }

  const isLocked = () => {
    if (!incident) return true
    return incident.locked_at !== null
  }

  const getTimeRemaining = () => {
    if (!incident || incident.locked_at) return null

    const reportedAt = new Date(incident.reported_at)
    const lockTime = new Date(reportedAt.getTime() + 30 * 60 * 1000) // 30 minutes
    const now = new Date()
    const remaining = lockTime.getTime() - now.getTime()

    if (remaining <= 0) return null

    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'serious':
        return 'bg-orange-500 text-white'
      case 'moderate':
        return 'bg-yellow-500 text-white'
      case 'minor':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-slate-500 text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-500 text-white'
      case 'submitted':
        return 'bg-blue-500 text-white'
      case 'draft':
        return 'bg-slate-500 text-white'
      case 'closed':
        return 'bg-slate-700 text-white'
      default:
        return 'bg-slate-500 text-white'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800
                      flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-seahawks-green/20 border-t-seahawks-green"></div>
          <p className="text-seahawks-navy dark:text-seahawks-green font-semibold">Loading Incident...</p>
        </div>
      </div>
    )
  }

  if (!incident) {
    return <div>Incident not found</div>
  }

  const locked = isLocked()
  const timeRemaining = getTimeRemaining()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100
                     dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Fixed Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/incidents"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800
                         hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Back to Incidents</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-seahawks-navy to-red-600
                               dark:from-white dark:to-red-400 bg-clip-text text-transparent">
                  Incident Report
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  ID: {incident.id.slice(0, 8)}
                </p>
              </div>
            </div>

            {!locked && (
              <Link
                href={`/incidents/edit/${incident.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-seahawks-green text-white rounded-xl font-semibold
                         shadow-lg shadow-seahawks-green/30 hover:shadow-xl hover:shadow-seahawks-green/40
                         transition-all hover:scale-105 active:scale-95"
              >
                <Edit className="w-5 h-5" />
                Edit Report
              </Link>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getSeverityColor(incident.severity)}`}>
              {incident.severity.toUpperCase()} SEVERITY
            </span>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(incident.status)}`}>
              {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </span>
            {locked ? (
              <span className="px-4 py-2 rounded-full bg-slate-700 dark:bg-slate-600 text-white text-sm font-bold flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Locked
              </span>
            ) : timeRemaining ? (
              <span className="px-4 py-2 rounded-full bg-orange-500 text-white text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Edit Window: {timeRemaining}
              </span>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Section 1: Incident Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-red-500" />
              Incident Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Date of Incident</div>
                <div className="text-lg text-slate-900 dark:text-white">
                  {new Date(incident.incident_date).toLocaleDateString()}
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Time of Incident</div>
                <div className="text-lg text-slate-900 dark:text-white">{incident.incident_time}</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Location</div>
                <div className="text-lg text-slate-900 dark:text-white">{incident.location}</div>
              </div>

              {incident.activity_type && (
                <div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Activity Type</div>
                  <div className="text-lg text-slate-900 dark:text-white">{incident.activity_type}</div>
                </div>
              )}

              <div className="md:col-span-2">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Incident Type</div>
                <div className="text-lg text-slate-900 dark:text-white">{incident.incident_type}</div>
              </div>
            </div>
          </div>

          {/* Section 2: Injured Party Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Injured Party Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</div>
                <div className="text-lg text-slate-900 dark:text-white">{incident.injured_name}</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Age</div>
                <div className="text-lg text-slate-900 dark:text-white">{incident.injured_age}</div>
              </div>

              {incident.injured_gender && (
                <div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Gender</div>
                  <div className="text-lg text-slate-900 dark:text-white capitalize">{incident.injured_gender}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Phone Number</div>
                <div className="text-lg text-slate-900 dark:text-white">{incident.injured_phone}</div>
              </div>

              {incident.injured_email && (
                <div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Email Address</div>
                  <div className="text-lg text-slate-900 dark:text-white">{incident.injured_email}</div>
                </div>
              )}

              {incident.injured_address && (
                <div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Address</div>
                  <div className="text-lg text-slate-900 dark:text-white">{incident.injured_address}</div>
                </div>
              )}

              {incident.emergency_contact_name && (
                <div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Emergency Contact</div>
                  <div className="text-lg text-slate-900 dark:text-white">{incident.emergency_contact_name}</div>
                </div>
              )}

              {incident.emergency_contact_phone && (
                <div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">Emergency Contact Phone</div>
                  <div className="text-lg text-slate-900 dark:text-white">{incident.emergency_contact_phone}</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Injury Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Injury Details</h2>

            {/* Body Diagram */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Injured Body Regions</div>
              <BodyDiagram selectedRegions={incident.body_regions_selected} onRegionToggle={() => {}} disabled />
            </div>

            {/* Injury Descriptions */}
            {Object.keys(incident.injury_descriptions as object).length > 0 && (
              <div className="mb-6 space-y-4">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">Injury Descriptions</div>
                {Object.entries(incident.injury_descriptions as Record<string, string>).map(([region, description]) => (
                  <div key={region} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">
                      {regionLabels[region]}
                    </div>
                    <div className="text-slate-900 dark:text-white">{description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Severity and Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Bleeding Present</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {incident.bleeding_present ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Loss of Consciousness</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {incident.loss_of_consciousness ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Severity</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getSeverityColor(incident.severity)}`}>
                  {incident.severity.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Detailed Description</div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-white whitespace-pre-wrap">
                {incident.detailed_description}
              </div>
            </div>

            {/* Contributing Factors */}
            {incident.contributing_factors && incident.contributing_factors.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Contributing Factors</div>
                <div className="flex flex-wrap gap-2">
                  {incident.contributing_factors.map((factor) => (
                    <span
                      key={factor}
                      className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300
                               rounded-full text-sm font-semibold"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Treatment Provided */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Treatment Provided</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">First Aid Provided</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {incident.first_aid_provided ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">EMS Called</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {incident.ems_called ? 'Yes' : 'No'}
                </div>
              </div>

              {incident.treatment_details && (
                <div className="md:col-span-2">
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Treatment Details</div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-900 dark:text-white">
                    {incident.treatment_details}
                  </div>
                </div>
              )}

              {incident.staff_provided_treatment && (
                <div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Staff Who Provided Treatment</div>
                  <div className="text-lg text-slate-900 dark:text-white">{incident.staff_provided_treatment}</div>
                </div>
              )}

              {incident.ems_arrival_time && (
                <div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">EMS Arrival Time</div>
                  <div className="text-lg text-slate-900 dark:text-white">{incident.ems_arrival_time}</div>
                </div>
              )}

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Hospital Transport</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {incident.hospital_transport ? 'Yes' : 'No'}
                </div>
              </div>

              {incident.hospital_name && (
                <div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Hospital Name</div>
                  <div className="text-lg text-slate-900 dark:text-white">{incident.hospital_name}</div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Report Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Report Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Reported By</div>
                <div className="text-lg text-slate-900 dark:text-white">
                  {reporterProfile?.full_name || 'Unknown'}
                </div>
                {reporterProfile?.email && (
                  <div className="text-sm text-slate-500 dark:text-slate-400">{reporterProfile.email}</div>
                )}
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Reporter Position</div>
                <div className="text-lg text-slate-900 dark:text-white">{incident.reporter_position}</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Reported At</div>
                <div className="text-lg text-slate-900 dark:text-white">
                  {new Date(incident.reported_at).toLocaleString()}
                </div>
              </div>

              {incident.locked_at && (
                <div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Locked At</div>
                  <div className="text-lg text-slate-900 dark:text-white">
                    {new Date(incident.locked_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Witnesses */}
            {incident.witnesses && Array.isArray(incident.witnesses) && (incident.witnesses as any[]).length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Witnesses</div>
                <div className="space-y-3">
                  {(incident.witnesses as Array<{ name: string; phone?: string; email?: string }>).map((witness, index) => (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <div className="font-semibold text-slate-900 dark:text-white">{witness.name}</div>
                      {witness.phone && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">Phone: {witness.phone}</div>
                      )}
                      {witness.email && (
                        <div className="text-sm text-slate-600 dark:text-slate-400">Email: {witness.email}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Manager Review Section */}
          {incident.status === 'reviewed' && incident.reviewed_by && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-500 dark:border-green-700 shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-300 mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Manager Review
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Reviewed At</div>
                  <div className="text-lg text-green-900 dark:text-green-200">
                    {incident.reviewed_at ? new Date(incident.reviewed_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              {incident.manager_comments && (
                <div className="mt-6">
                  <div className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Manager Comments</div>
                  <div className="p-4 bg-white dark:bg-slate-900/50 rounded-lg text-green-900 dark:text-green-200 whitespace-pre-wrap">
                    {incident.manager_comments}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
