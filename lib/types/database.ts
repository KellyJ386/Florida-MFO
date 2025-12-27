export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'admin' | 'manager' | 'staff'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'staff'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'manager' | 'staff'
          created_at?: string
          updated_at?: string
        }
      }
      ice_depth_templates: {
        Row: {
          id: string
          name: string
          rink_svg: string
          measurement_points: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          rink_svg: string
          measurement_points: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          rink_svg?: string
          measurement_points?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      ice_depth_measurements: {
        Row: {
          id: string
          template_id: string
          recorded_by: string
          measurement_date: string
          measurements: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          recorded_by: string
          measurement_date: string
          measurements: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          recorded_by?: string
          measurement_date?: string
          measurements?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_report_templates: {
        Row: {
          id: string
          name: string
          tabs: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tabs: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tabs?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          template_id: string
          report_date: string
          shift: 'morning' | 'afternoon' | 'evening'
          submitted_by: string
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          template_id: string
          report_date: string
          shift: 'morning' | 'afternoon' | 'evening'
          submitted_by: string
          data: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          report_date?: string
          shift?: 'morning' | 'afternoon' | 'evening'
          submitted_by?: string
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      employee_schedules: {
        Row: {
          id: string
          employee_id: string
          schedule_date: string
          shift_type: 'morning' | 'afternoon' | 'evening'
          start_time: string
          end_time: string
          position: string | null
          notes: string | null
          status: 'scheduled' | 'completed' | 'cancelled' | 'swap_requested'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          schedule_date: string
          shift_type: 'morning' | 'afternoon' | 'evening'
          start_time: string
          end_time: string
          position?: string | null
          notes?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled' | 'swap_requested'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          schedule_date?: string
          shift_type?: 'morning' | 'afternoon' | 'evening'
          start_time?: string
          end_time?: string
          position?: string | null
          notes?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled' | 'swap_requested'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shift_swap_requests: {
        Row: {
          id: string
          original_schedule_id: string
          requested_by: string
          swap_with: string | null
          reason: string | null
          status: 'pending' | 'approved' | 'denied' | 'cancelled'
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          original_schedule_id: string
          requested_by: string
          swap_with?: string | null
          reason?: string | null
          status?: 'pending' | 'approved' | 'denied' | 'cancelled'
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          original_schedule_id?: string
          requested_by?: string
          swap_with?: string | null
          reason?: string | null
          status?: 'pending' | 'approved' | 'denied' | 'cancelled'
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employee_availability: {
        Row: {
          id: string
          employee_id: string
          day_of_week: number
          shift_type: 'morning' | 'afternoon' | 'evening'
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          day_of_week: number
          shift_type: 'morning' | 'afternoon' | 'evening'
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          day_of_week?: number
          shift_type?: 'morning' | 'afternoon' | 'evening'
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      schedule_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          template_data: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          template_data?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          template_data?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      incidents: {
        Row: {
          id: string
          incident_date: string
          incident_time: string
          location: string
          activity_type: string | null
          incident_type: string
          injured_name: string
          injured_age: number
          injured_gender: string | null
          injured_phone: string
          injured_email: string | null
          injured_address: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          body_regions_selected: string[]
          injury_descriptions: Json
          severity: 'minor' | 'moderate' | 'serious' | 'critical'
          bleeding_present: boolean
          loss_of_consciousness: boolean
          detailed_description: string
          contributing_factors: string[] | null
          first_aid_provided: boolean
          treatment_details: string | null
          staff_provided_treatment: string | null
          ems_called: boolean
          ems_arrival_time: string | null
          hospital_transport: boolean
          hospital_name: string | null
          witnesses: Json | null
          reported_by: string
          reported_at: string
          reporter_position: string
          reporter_signature: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          manager_signature: string | null
          manager_comments: string | null
          status: 'draft' | 'submitted' | 'reviewed' | 'closed'
          locked_at: string | null
          edit_history: Json | null
          comments: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          incident_date: string
          incident_time: string
          location: string
          activity_type?: string | null
          incident_type: string
          injured_name: string
          injured_age: number
          injured_gender?: string | null
          injured_phone: string
          injured_email?: string | null
          injured_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          body_regions_selected: string[]
          injury_descriptions: Json
          severity: 'minor' | 'moderate' | 'serious' | 'critical'
          bleeding_present?: boolean
          loss_of_consciousness?: boolean
          detailed_description: string
          contributing_factors?: string[] | null
          first_aid_provided?: boolean
          treatment_details?: string | null
          staff_provided_treatment?: string | null
          ems_called?: boolean
          ems_arrival_time?: string | null
          hospital_transport?: boolean
          hospital_name?: string | null
          witnesses?: Json | null
          reported_by: string
          reported_at?: string
          reporter_position: string
          reporter_signature?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          manager_signature?: string | null
          manager_comments?: string | null
          status?: 'draft' | 'submitted' | 'reviewed' | 'closed'
          locked_at?: string | null
          edit_history?: Json | null
          comments?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          incident_date?: string
          incident_time?: string
          location?: string
          activity_type?: string | null
          incident_type?: string
          injured_name?: string
          injured_age?: number
          injured_gender?: string | null
          injured_phone?: string
          injured_email?: string | null
          injured_address?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          body_regions_selected?: string[]
          injury_descriptions?: Json
          severity?: 'minor' | 'moderate' | 'serious' | 'critical'
          bleeding_present?: boolean
          loss_of_consciousness?: boolean
          detailed_description?: string
          contributing_factors?: string[] | null
          first_aid_provided?: boolean
          treatment_details?: string | null
          staff_provided_treatment?: string | null
          ems_called?: boolean
          ems_arrival_time?: string | null
          hospital_transport?: boolean
          hospital_name?: string | null
          witnesses?: Json | null
          reported_by?: string
          reported_at?: string
          reporter_position?: string
          reporter_signature?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          manager_signature?: string | null
          manager_comments?: string | null
          status?: 'draft' | 'submitted' | 'reviewed' | 'closed'
          locked_at?: string | null
          edit_history?: Json | null
          comments?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      ice_makes: {
        Row: {
          id: string
          facility_id: string
          machine_id: string
          rink_id: string
          operator_id: string
          make_date: string
          make_time: string
          type: 'wet' | 'dry'
          water_used_gallons: number | null
          snow_percentage: number
          battery_start_percentage: number | null
          battery_finish_percentage: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          machine_id: string
          rink_id: string
          operator_id: string
          make_date: string
          make_time: string
          type: 'wet' | 'dry'
          water_used_gallons?: number | null
          snow_percentage: number
          battery_start_percentage?: number | null
          battery_finish_percentage?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          machine_id?: string
          rink_id?: string
          operator_id?: string
          make_date?: string
          make_time?: string
          type?: 'wet' | 'dry'
          water_used_gallons?: number | null
          snow_percentage?: number
          battery_start_percentage?: number | null
          battery_finish_percentage?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      blade_changes: {
        Row: {
          id: string
          facility_id: string
          machine_id: string
          changed_by: string
          change_date: string
          change_time: string
          notes: string | null
          alert_expires_at: string | null
          acknowledged_by: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          machine_id: string
          changed_by: string
          change_date: string
          change_time: string
          notes?: string | null
          alert_expires_at?: string | null
          acknowledged_by?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          machine_id?: string
          changed_by?: string
          change_date?: string
          change_time?: string
          notes?: string | null
          alert_expires_at?: string | null
          acknowledged_by?: string[] | null
          created_at?: string
        }
      }
      circle_checks: {
        Row: {
          id: string
          facility_id: string
          machine_id: string
          operator_id: string
          check_date: string
          check_time: string
          checkpoints: Json
          total_checkpoints: number
          passed_checkpoints: number
          failed_checkpoints: number
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          machine_id: string
          operator_id: string
          check_date: string
          check_time: string
          checkpoints: Json
          total_checkpoints: number
          passed_checkpoints: number
          failed_checkpoints: number
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          machine_id?: string
          operator_id?: string
          check_date?: string
          check_time?: string
          checkpoints?: Json
          total_checkpoints?: number
          passed_checkpoints?: number
          failed_checkpoints?: number
          created_at?: string
        }
      }
    }
  }
}

export type MeasurementPoint = {
  id: string
  x: number
  y: number
  label: string
  targetDepth: number
  tolerance: number
}

export type Measurement = {
  pointId: string
  value: number
  status: 'ideal' | 'warning' | 'critical'
  timestamp: string
}

export type ReportTab = {
  id: string
  title: string
  fields: ReportField[]
}

export type ReportField = {
  id: string
  type: 'text' | 'number' | 'textarea' | 'checkbox' | 'select' | 'time'
  label: string
  required: boolean
  options?: string[]
}
