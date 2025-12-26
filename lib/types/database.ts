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
