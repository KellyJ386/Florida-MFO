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
          photos: string[]
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
          photos?: string[]
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
          photos?: string[]
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
