-- Migration: Add Priority Modules (Incidents, Ice Operations, Air Quality, Refrigeration)
-- Created: 2024-01-01
-- Description: Creates all tables for the 4 priority modules with RLS policies

-- ============================================================================
-- PRIORITY 1: INCIDENT & ACCIDENT REPORTING MODULE
-- ============================================================================

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES auth.users(id),

  -- Incident Details
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,
  location TEXT NOT NULL,
  activity_type TEXT,
  incident_type TEXT NOT NULL,

  -- Injured Party Information
  injured_name TEXT NOT NULL,
  injured_age INTEGER NOT NULL,
  injured_gender TEXT,
  injured_contact_name TEXT,
  injured_contact_phone TEXT,

  -- Injury Details
  body_regions_selected TEXT[] NOT NULL DEFAULT '{}',
  injury_descriptions JSONB NOT NULL DEFAULT '{}',
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'serious', 'critical')),
  bleeding_present BOOLEAN NOT NULL DEFAULT false,
  loss_of_consciousness BOOLEAN NOT NULL DEFAULT false,

  -- Treatment Information
  first_aid_given BOOLEAN NOT NULL DEFAULT false,
  first_aid_details TEXT,
  ems_called BOOLEAN NOT NULL DEFAULT false,
  ems_arrival_time TIME,
  hospital_transport BOOLEAN NOT NULL DEFAULT false,
  hospital_name TEXT,

  -- Report Details
  detailed_description TEXT NOT NULL,
  witnesses TEXT[] DEFAULT '{}',
  photos_attached TEXT[] DEFAULT '{}',

  -- Status & Workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed', 'closed')),
  reported_by UUID REFERENCES auth.users(id),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- Immutability & Edit Window
  locked_at TIMESTAMPTZ,
  edit_history JSONB DEFAULT '[]',

  -- Notifications
  notifications_sent JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for incidents
CREATE INDEX idx_incidents_facility_id ON incidents(facility_id);
CREATE INDEX idx_incidents_incident_date ON incidents(incident_date);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_locked_at ON incidents(locked_at);

-- Enable RLS for incidents
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incidents
CREATE POLICY "Users can view incidents at their facility"
  ON incidents FOR SELECT
  USING (auth.uid() = facility_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

CREATE POLICY "Users can create incidents"
  ON incidents FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can update unlocked incidents they created"
  ON incidents FOR UPDATE
  USING (auth.uid() = reported_by AND (locked_at IS NULL OR locked_at > NOW()))
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admins and managers can update any incident"
  ON incidents FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

-- ============================================================================
-- PRIORITY 2: ICE OPERATIONS MODULE
-- ============================================================================

-- Create ice_makes table
CREATE TABLE IF NOT EXISTS ice_makes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES auth.users(id),
  machine_id TEXT NOT NULL,
  rink_id TEXT NOT NULL,
  operator_id UUID REFERENCES auth.users(id),

  -- Ice Make Details
  make_date DATE NOT NULL,
  make_time TIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('wet', 'dry')),

  -- Water & Snow
  water_used_gallons DECIMAL(10, 2),
  snow_percentage INTEGER NOT NULL CHECK (snow_percentage >= 0 AND snow_percentage <= 100),

  -- Battery Levels (for electric machines)
  battery_start_percentage INTEGER CHECK (battery_start_percentage >= 0 AND battery_start_percentage <= 100),
  battery_finish_percentage INTEGER CHECK (battery_finish_percentage >= 0 AND battery_finish_percentage <= 100),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for ice_makes
CREATE INDEX idx_ice_makes_facility_id ON ice_makes(facility_id);
CREATE INDEX idx_ice_makes_make_date ON ice_makes(make_date);
CREATE INDEX idx_ice_makes_machine_id ON ice_makes(machine_id);
CREATE INDEX idx_ice_makes_operator_id ON ice_makes(operator_id);

-- Enable RLS for ice_makes
ALTER TABLE ice_makes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ice_makes
CREATE POLICY "Users can view ice makes at their facility"
  ON ice_makes FOR SELECT
  USING (auth.uid() = facility_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager', 'staff')));

CREATE POLICY "Users can create ice makes"
  ON ice_makes FOR INSERT
  WITH CHECK (auth.uid() = operator_id);

CREATE POLICY "Users can update their own ice makes"
  ON ice_makes FOR UPDATE
  USING (auth.uid() = operator_id);

-- Create blade_changes table
CREATE TABLE IF NOT EXISTS blade_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES auth.users(id),
  machine_id TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),

  -- Change Details
  change_date DATE NOT NULL,
  change_time TIME NOT NULL,
  notes TEXT,

  -- Alert System (7-day warning)
  alert_expires_at TIMESTAMPTZ,
  acknowledged_by UUID[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for blade_changes
CREATE INDEX idx_blade_changes_facility_id ON blade_changes(facility_id);
CREATE INDEX idx_blade_changes_change_date ON blade_changes(change_date);
CREATE INDEX idx_blade_changes_machine_id ON blade_changes(machine_id);
CREATE INDEX idx_blade_changes_alert_expires_at ON blade_changes(alert_expires_at);

-- Enable RLS for blade_changes
ALTER TABLE blade_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blade_changes
CREATE POLICY "Users can view blade changes at their facility"
  ON blade_changes FOR SELECT
  USING (auth.uid() = facility_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager', 'staff')));

CREATE POLICY "Users can create blade changes"
  ON blade_changes FOR INSERT
  WITH CHECK (auth.uid() = changed_by);

CREATE POLICY "Users can update blade changes"
  ON blade_changes FOR UPDATE
  USING (auth.uid() = changed_by OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

-- Create circle_checks table
CREATE TABLE IF NOT EXISTS circle_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES auth.users(id),
  machine_id TEXT NOT NULL,
  operator_id UUID REFERENCES auth.users(id),

  -- Check Details
  check_date DATE NOT NULL,
  check_time TIME NOT NULL,

  -- Checkpoint Results
  checkpoints JSONB NOT NULL DEFAULT '{}',
  total_checkpoints INTEGER NOT NULL,
  passed_checkpoints INTEGER NOT NULL,
  failed_checkpoints INTEGER NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for circle_checks
CREATE INDEX idx_circle_checks_facility_id ON circle_checks(facility_id);
CREATE INDEX idx_circle_checks_check_date ON circle_checks(check_date);
CREATE INDEX idx_circle_checks_machine_id ON circle_checks(machine_id);
CREATE INDEX idx_circle_checks_operator_id ON circle_checks(operator_id);
CREATE INDEX idx_circle_checks_failed_checkpoints ON circle_checks(failed_checkpoints);

-- Enable RLS for circle_checks
ALTER TABLE circle_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for circle_checks
CREATE POLICY "Users can view circle checks at their facility"
  ON circle_checks FOR SELECT
  USING (auth.uid() = facility_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager', 'staff')));

CREATE POLICY "Users can create circle checks"
  ON circle_checks FOR INSERT
  WITH CHECK (auth.uid() = operator_id);

CREATE POLICY "Admins and managers can update circle checks"
  ON circle_checks FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

-- ============================================================================
-- PRIORITY 3: AIR QUALITY COMPLIANCE MODULE
-- ============================================================================

-- Create air_quality_readings table
CREATE TABLE IF NOT EXISTS air_quality_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES auth.users(id),
  location TEXT NOT NULL,
  recorded_by UUID REFERENCES auth.users(id),

  -- Reading Details
  reading_date DATE NOT NULL,
  reading_time TIME NOT NULL,

  -- CO (Carbon Monoxide) - OSHA PEL: 50 ppm TWA
  co_instant DECIMAL(10, 2),
  co_1hr_avg DECIMAL(10, 2),

  -- NO2 (Nitrogen Dioxide) - OSHA PEL: 5 ppm ceiling
  no2_instant DECIMAL(10, 2),
  no2_1hr_avg DECIMAL(10, 2),

  -- CO2 (Carbon Dioxide) - OSHA PEL: 5000 ppm TWA
  co2_instant INTEGER,
  co2_1hr_avg INTEGER,

  -- Status & Alerts
  status TEXT,
  incident_triggered BOOLEAN DEFAULT false,
  incident_id UUID REFERENCES incidents(id),

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for air_quality_readings
CREATE INDEX idx_air_quality_readings_facility_id ON air_quality_readings(facility_id);
CREATE INDEX idx_air_quality_readings_reading_date ON air_quality_readings(reading_date);
CREATE INDEX idx_air_quality_readings_location ON air_quality_readings(location);
CREATE INDEX idx_air_quality_readings_status ON air_quality_readings(status);
CREATE INDEX idx_air_quality_readings_incident_triggered ON air_quality_readings(incident_triggered);

-- Enable RLS for air_quality_readings
ALTER TABLE air_quality_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for air_quality_readings
CREATE POLICY "Users can view air quality readings at their facility"
  ON air_quality_readings FOR SELECT
  USING (auth.uid() = facility_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager', 'staff')));

CREATE POLICY "Users can create air quality readings"
  ON air_quality_readings FOR INSERT
  WITH CHECK (auth.uid() = recorded_by);

CREATE POLICY "Users can update air quality readings"
  ON air_quality_readings FOR UPDATE
  USING (auth.uid() = recorded_by OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

-- Create air_quality_sensors table
CREATE TABLE IF NOT EXISTS air_quality_sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES auth.users(id),
  sensor_id TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,
  sensor_type TEXT NOT NULL,

  -- Calibration
  last_calibrated_at TIMESTAMPTZ,
  calibrated_by UUID REFERENCES auth.users(id),
  calibration_due_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for air_quality_sensors
CREATE INDEX idx_air_quality_sensors_facility_id ON air_quality_sensors(facility_id);
CREATE INDEX idx_air_quality_sensors_sensor_id ON air_quality_sensors(sensor_id);
CREATE INDEX idx_air_quality_sensors_calibration_due_at ON air_quality_sensors(calibration_due_at);

-- Enable RLS for air_quality_sensors
ALTER TABLE air_quality_sensors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for air_quality_sensors
CREATE POLICY "Users can view sensors at their facility"
  ON air_quality_sensors FOR SELECT
  USING (auth.uid() = facility_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager', 'staff')));

CREATE POLICY "Admins and managers can manage sensors"
  ON air_quality_sensors FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

-- ============================================================================
-- PRIORITY 4: REFRIGERATION PLANT MONITORING MODULE
-- ============================================================================

-- Create refrigeration_logs table
CREATE TABLE IF NOT EXISTS refrigeration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES auth.users(id),
  operator_id UUID REFERENCES auth.users(id),

  -- Log Details
  log_date DATE NOT NULL,
  log_time TIME NOT NULL,
  inspection_number INTEGER,

  -- High-Side System
  discharge_pressure DECIMAL(10, 2),
  discharge_temp DECIMAL(10, 2),

  -- Low-Side System
  suction_pressure DECIMAL(10, 2),
  suction_temp DECIMAL(10, 2),

  -- Brine System
  brine_supply_temp DECIMAL(10, 2),
  brine_return_temp DECIMAL(10, 2),
  brine_flow_rate DECIMAL(10, 2),
  brine_concentration DECIMAL(10, 2),

  -- Compressor Data
  compressor_data JSONB DEFAULT '{}',

  -- Operator Certification
  operator_certificate_number TEXT,

  -- Notes & Alerts
  notes TEXT,
  alerts_triggered TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for refrigeration_logs
CREATE INDEX idx_refrigeration_logs_facility_id ON refrigeration_logs(facility_id);
CREATE INDEX idx_refrigeration_logs_log_date ON refrigeration_logs(log_date);
CREATE INDEX idx_refrigeration_logs_operator_id ON refrigeration_logs(operator_id);
CREATE INDEX idx_refrigeration_logs_inspection_number ON refrigeration_logs(inspection_number);

-- Enable RLS for refrigeration_logs
ALTER TABLE refrigeration_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for refrigeration_logs
CREATE POLICY "Users can view refrigeration logs at their facility"
  ON refrigeration_logs FOR SELECT
  USING (auth.uid() = facility_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager', 'staff')));

CREATE POLICY "Users can create refrigeration logs"
  ON refrigeration_logs FOR INSERT
  WITH CHECK (auth.uid() = operator_id);

CREATE POLICY "Users can update their own refrigeration logs"
  ON refrigeration_logs FOR UPDATE
  USING (auth.uid() = operator_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

-- Create compressor_configs table
CREATE TABLE IF NOT EXISTS compressor_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES auth.users(id),
  compressor_id TEXT NOT NULL,

  -- Threshold Settings
  discharge_pressure_min DECIMAL(10, 2),
  discharge_pressure_max DECIMAL(10, 2),
  discharge_temp_min DECIMAL(10, 2),
  discharge_temp_max DECIMAL(10, 2),
  suction_pressure_min DECIMAL(10, 2),
  suction_pressure_max DECIMAL(10, 2),
  suction_temp_min DECIMAL(10, 2),
  suction_temp_max DECIMAL(10, 2),

  -- Brine Thresholds
  brine_supply_temp_min DECIMAL(10, 2),
  brine_supply_temp_max DECIMAL(10, 2),
  brine_return_temp_min DECIMAL(10, 2),
  brine_return_temp_max DECIMAL(10, 2),
  brine_concentration_min DECIMAL(10, 2),
  brine_concentration_max DECIMAL(10, 2),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for compressor_configs
CREATE INDEX idx_compressor_configs_facility_id ON compressor_configs(facility_id);
CREATE INDEX idx_compressor_configs_compressor_id ON compressor_configs(compressor_id);

-- Enable RLS for compressor_configs
ALTER TABLE compressor_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compressor_configs
CREATE POLICY "Users can view compressor configs at their facility"
  ON compressor_configs FOR SELECT
  USING (auth.uid() = facility_id OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager', 'staff')));

CREATE POLICY "Admins and managers can manage compressor configs"
  ON compressor_configs FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'manager')));

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ice_makes_updated_at BEFORE UPDATE ON ice_makes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blade_changes_updated_at BEFORE UPDATE ON blade_changes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circle_checks_updated_at BEFORE UPDATE ON circle_checks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_air_quality_readings_updated_at BEFORE UPDATE ON air_quality_readings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_air_quality_sensors_updated_at BEFORE UPDATE ON air_quality_sensors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refrigeration_logs_updated_at BEFORE UPDATE ON refrigeration_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compressor_configs_updated_at BEFORE UPDATE ON compressor_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUTO-LOCK FUNCTION FOR INCIDENTS (30-MINUTE EDIT WINDOW)
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_lock_incident()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-lock incident if 30 minutes have passed since reporting
  IF NEW.locked_at IS NULL AND NEW.reported_at + INTERVAL '30 minutes' <= NOW() THEN
    NEW.locked_at = NEW.reported_at + INTERVAL '30 minutes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_lock_incident_trigger BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION auto_lock_incident();
