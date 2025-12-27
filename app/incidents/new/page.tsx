'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, Home, Save, Send } from 'lucide-react'
import Link from 'next/link'
import { BodyDiagram } from '@/components/incidents/BodyDiagram'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const ACTIVITY_TYPES = [
  'Public Skate',
  'Hockey Game',
  'Hockey Practice',
  'Learn to Skate',
  'Figure Skating',
  'Broomball',
  'Birthday Party',
  'Open Skate',
  'Drop-In Hockey',
  'Other',
]

const INCIDENT_TYPES = [
  'Skater-to-Skater Collision',
  'Skate Blade Cut',
  'Puck Strike',
  'Head Injury/Concussion',
  'Fall on Ice',
  'Board/Glass Impact',
  'Zamboni-Related',
  'Equipment Failure',
  'Dental Injury',
  'Eye Injury',
  'Other',
]

const LOCATIONS = [
  'Ice Surface - Main Rink',
  'Ice Surface - Practice Rink',
  'Bench Area',
  'Penalty Box',
  'Zamboni Entrance',
  'Spectator Stands',
  'Locker Room',
  'Lobby',
  'Parking Lot',
  'Other',
]

const CONTRIBUTING_FACTORS = [
  'Wet ice',
  'Poor visibility',
  'Crowded conditions',
  'Inexperienced skater',
  'Equipment malfunction',
  'Horseplay',
  'Not following rules',
  'Other',
]

export default function NewIncidentPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Section 1: Incident Information
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentTime, setIncidentTime] = useState('')
  const [location, setLocation] = useState('')
  const [activityType, setActivityType] = useState('')
  const [incidentType, setIncidentType] = useState('')

  // Section 2: Injured Party Information
  const [injuredName, setInjuredName] = useState('')
  const [injuredAge, setInjuredAge] = useState('')
  const [injuredGender, setInjuredGender] = useState('')
  const [injuredPhone, setInjuredPhone] = useState('')
  const [injuredEmail, setInjuredEmail] = useState('')
  const [injuredAddress, setInjuredAddress] = useState('')
  const [emergencyContactName, setEmergencyContactName] = useState('')
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('')

  // Section 3: Injury Details
  const [selectedBodyRegions, setSelectedBodyRegions] = useState<string[]>([])
  const [injuryDescriptions, setInjuryDescriptions] = useState<Record<string, string>>({})
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'serious' | 'critical'>('minor')
  const [bleedingPresent, setBleedingPresent] = useState(false)
  const [lossOfConsciousness, setLossOfConsciousness] = useState(false)
  const [detailedDescription, setDetailedDescription] = useState('')
  const [contributingFactors, setContributingFactors] = useState<string[]>([])

  // Section 4: Treatment Provided
  const [firstAidProvided, setFirstAidProvided] = useState(false)
  const [treatmentDetails, setTreatmentDetails] = useState('')
  const [staffProvidedTreatment, setStaffProvidedTreatment] = useState('')
  const [emsCalled, setEmsCalled] = useState(false)
  const [emsArrivalTime, setEmsArrivalTime] = useState('')
  const [hospitalTransport, setHospitalTransport] = useState(false)
  const [hospitalName, setHospitalName] = useState('')

  // Section 5: Report Completion
  const [reporterPosition, setReporterPosition] = useState('')
  const [witnesses, setWitnesses] = useState<Array<{ name: string; phone: string; email: string }>>([
    { name: '', phone: '', email: '' },
  ])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
    } else {
      setUser(user)
    }
  }

  const handleRegionToggle = (region: string) => {
    if (selectedBodyRegions.includes(region)) {
      setSelectedBodyRegions(selectedBodyRegions.filter((r) => r !== region))
      const newDescriptions = { ...injuryDescriptions }
      delete newDescriptions[region]
      setInjuryDescriptions(newDescriptions)
    } else {
      setSelectedBodyRegions([...selectedBodyRegions, region])
    }
  }

  const handleInjuryDescriptionChange = (region: string, description: string) => {
    setInjuryDescriptions({
      ...injuryDescriptions,
      [region]: description,
    })
  }

  const addWitness = () => {
    setWitnesses([...witnesses, { name: '', phone: '', email: '' }])
  }

  const removeWitness = (index: number) => {
    setWitnesses(witnesses.filter((_, i) => i !== index))
  }

  const updateWitness = (index: number, field: 'name' | 'phone' | 'email', value: string) => {
    const newWitnesses = [...witnesses]
    newWitnesses[index][field] = value
    setWitnesses(newWitnesses)
  }

  const handleToggleFactor = (factor: string) => {
    if (contributingFactors.includes(factor)) {
      setContributingFactors(contributingFactors.filter((f) => f !== factor))
    } else {
      setContributingFactors([...contributingFactors, factor])
    }
  }

  const validateForm = () => {
    // Required fields
    if (!incidentDate || !incidentTime || !location || !incidentType) {
      alert('Please fill in all incident information fields')
      return false
    }

    if (!injuredName || !injuredAge || !injuredPhone) {
      alert('Please fill in required injured party information')
      return false
    }

    if (selectedBodyRegions.length === 0) {
      alert('Please select at least one injured body region')
      return false
    }

    // Check all selected regions have descriptions
    for (const region of selectedBodyRegions) {
      if (!injuryDescriptions[region] || injuryDescriptions[region].trim() === '') {
        alert(`Please provide injury description for ${region.replace('_', ' ')}`)
        return false
      }
    }

    if (!detailedDescription) {
      alert('Please provide a detailed description of the incident')
      return false
    }

    if (!reporterPosition) {
      alert('Please enter your position/title')
      return false
    }

    return true
  }

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (status === 'submitted' && !validateForm()) {
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('incidents').insert({
        incident_date: incidentDate,
        incident_time: incidentTime,
        location,
        activity_type: activityType || null,
        incident_type: incidentType,
        injured_name: injuredName,
        injured_age: parseInt(injuredAge),
        injured_gender: injuredGender || null,
        injured_phone: injuredPhone,
        injured_email: injuredEmail || null,
        injured_address: injuredAddress || null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_phone: emergencyContactPhone || null,
        body_regions_selected: selectedBodyRegions,
        injury_descriptions: injuryDescriptions,
        severity,
        bleeding_present: bleedingPresent,
        loss_of_consciousness: lossOfConsciousness,
        detailed_description: detailedDescription,
        contributing_factors: contributingFactors.length > 0 ? contributingFactors : null,
        first_aid_provided: firstAidProvided,
        treatment_details: treatmentDetails || null,
        staff_provided_treatment: staffProvidedTreatment || null,
        ems_called: emsCalled,
        ems_arrival_time: emsArrivalTime || null,
        hospital_transport: hospitalTransport,
        hospital_name: hospitalName || null,
        witnesses: witnesses.filter((w) => w.name).length > 0 ? witnesses.filter((w) => w.name) : null,
        reported_by: user.id,
        reported_at: new Date().toISOString(),
        reporter_position: reporterPosition,
        status,
      })

      if (error) throw error

      router.push('/incidents')
    } catch (error) {
      console.error('Error submitting incident:', error)
      alert('Error submitting incident report')
    } finally {
      setLoading(false)
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

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-seahawks-navy to-red-600
                             dark:from-white dark:to-red-400 bg-clip-text text-transparent">
                New Incident Report
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg mt-1">
                Document incident details for safety and compliance
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Section 1: Incident Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm">1</span>
              Incident Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Date of Incident <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Time of Incident <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={incidentTime}
                  onChange={(e) => setIncidentTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select location...</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Activity at Time of Incident
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select activity...</option>
                  {ACTIVITY_TYPES.map((activity) => (
                    <option key={activity} value={activity}>
                      {activity}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Type of Incident <span className="text-red-500">*</span>
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Select incident type...</option>
                  {INCIDENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Injured Party Information */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm">2</span>
              Injured Party Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={injuredName}
                  onChange={(e) => setInjuredName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={injuredAge}
                  onChange={(e) => setInjuredAge(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Gender
                </label>
                <select
                  value={injuredGender}
                  onChange={(e) => setInjuredGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={injuredPhone}
                  onChange={(e) => setInjuredPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={injuredEmail}
                  onChange={(e) => setInjuredEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={injuredAddress}
                  onChange={(e) => setInjuredAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Injury Details */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm">3</span>
              Injury Details
            </h2>

            {/* Body Diagram */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Select Injured Body Regions <span className="text-red-500">*</span>
              </label>
              <BodyDiagram selectedRegions={selectedBodyRegions} onRegionToggle={handleRegionToggle} />
            </div>

            {/* Injury Descriptions for Selected Regions */}
            {selectedBodyRegions.length > 0 && (
              <div className="mb-6 space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Injury Description for Each Selected Region <span className="text-red-500">*</span>
                </label>
                {selectedBodyRegions.map((region) => (
                  <div key={region}>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                      {regionLabels[region]}
                    </label>
                    <textarea
                      value={injuryDescriptions[region] || ''}
                      onChange={(e) => handleInjuryDescriptionChange(region, e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                               focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder={`Describe injury to ${regionLabels[region].toLowerCase()}...`}
                      required
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Severity Level */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Severity Level <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['minor', 'moderate', 'serious', 'critical'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSeverity(level)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      severity === level
                        ? level === 'critical'
                          ? 'bg-red-500 text-white'
                          : level === 'serious'
                          ? 'bg-orange-500 text-white'
                          : level === 'moderate'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Yes/No Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Was bleeding present?
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bleedingPresent}
                    onChange={(e) => setBleedingPresent(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4
                                peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer
                                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['']
                                after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300
                                after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                                peer-checked:bg-red-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Loss of consciousness?
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lossOfConsciousness}
                    onChange={(e) => setLossOfConsciousness(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4
                                peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer
                                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['']
                                after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300
                                after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                                peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Detailed Description of Incident <span className="text-red-500">*</span>
              </label>
              <textarea
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                         bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Provide a detailed account of what happened, including circumstances leading up to the incident..."
                required
              />
            </div>

            {/* Contributing Factors */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Contributing Factors (select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CONTRIBUTING_FACTORS.map((factor) => (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => handleToggleFactor(factor)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      contributingFactors.includes(factor)
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {factor}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Treatment Provided */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm">4</span>
              Treatment Provided
            </h2>

            <div className="space-y-6">
              {/* First Aid Provided */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  First aid provided?
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={firstAidProvided}
                    onChange={(e) => setFirstAidProvided(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4
                                peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer
                                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['']
                                after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300
                                after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                                peer-checked:bg-red-500"></div>
                </label>
              </div>

              {firstAidProvided && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Treatment Details
                    </label>
                    <textarea
                      value={treatmentDetails}
                      onChange={(e) => setTreatmentDetails(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                               focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Describe first aid provided..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Staff Who Provided Treatment
                    </label>
                    <input
                      type="text"
                      value={staffProvidedTreatment}
                      onChange={(e) => setStaffProvidedTreatment(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                               focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Name(s) of staff member(s)"
                    />
                  </div>
                </>
              )}

              {/* EMS Called */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  EMS called?
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emsCalled}
                    onChange={(e) => setEmsCalled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4
                                peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer
                                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['']
                                after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300
                                after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                                peer-checked:bg-red-500"></div>
                </label>
              </div>

              {emsCalled && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    EMS Arrival Time
                  </label>
                  <input
                    type="time"
                    value={emsArrivalTime}
                    onChange={(e) => setEmsArrivalTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Hospital Transport */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Transported to hospital?
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hospitalTransport}
                    onChange={(e) => setHospitalTransport(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-600 peer-focus:outline-none peer-focus:ring-4
                                peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer
                                peer-checked:after:translate-x-full peer-checked:after:border-white after:content-['']
                                after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300
                                after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                                peer-checked:bg-red-500"></div>
                </label>
              </div>

              {hospitalTransport && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Hospital Name
                  </label>
                  <input
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                             bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Name of hospital"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Report Completion */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm">5</span>
              Report Completion
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Your Position/Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reporterPosition}
                  onChange={(e) => setReporterPosition(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                           bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Ice Technician, Manager, Front Desk Staff"
                  required
                />
              </div>

              {/* Witnesses */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Witnesses
                </label>
                <div className="space-y-4">
                  {witnesses.map((witness, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <input
                        type="text"
                        value={witness.name}
                        onChange={(e) => updateWitness(index, 'name', e.target.value)}
                        placeholder="Name"
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                                 bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                                 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                      <input
                        type="tel"
                        value={witness.phone}
                        onChange={(e) => updateWitness(index, 'phone', e.target.value)}
                        placeholder="Phone"
                        className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                                 bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                                 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={witness.email}
                          onChange={(e) => updateWitness(index, 'email', e.target.value)}
                          placeholder="Email"
                          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                                   bg-white dark:bg-slate-900 text-slate-900 dark:text-white
                                   focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        />
                        {witnesses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeWitness(index)}
                            className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400
                                     rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addWitness}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300
                             rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                  >
                    + Add Another Witness
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-slate-200 dark:bg-slate-700
                       text-slate-700 dark:text-slate-300 rounded-xl font-semibold
                       hover:bg-slate-300 dark:hover:bg-slate-600 transition-all hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              onClick={() => handleSubmit('submitted')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600
                       text-white rounded-xl font-semibold shadow-lg shadow-red-500/30
                       hover:shadow-xl hover:shadow-red-500/40 transition-all hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
