-- Employee Schedule Module Database Schema
-- Add this to your existing Supabase database

-- Employee schedules table
CREATE TABLE IF NOT EXISTS employee_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  shift_type shift_type NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  position TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'swap_requested')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, schedule_date, shift_type)
);

-- Shift swap requests table
CREATE TABLE IF NOT EXISTS shift_swap_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_schedule_id UUID REFERENCES employee_schedules(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  swap_with UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee availability table
CREATE TABLE IF NOT EXISTS employee_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  shift_type shift_type NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, day_of_week, shift_type)
);

-- Schedule templates table
CREATE TABLE IF NOT EXISTS schedule_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employee_schedules_employee ON employee_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_schedules_date ON employee_schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_shift_swap_requests_requested_by ON shift_swap_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_employee_availability_employee ON employee_availability(employee_id);

-- Enable RLS
ALTER TABLE employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_schedules
CREATE POLICY "Users can view all schedules"
  ON employee_schedules FOR SELECT
  USING (true);

CREATE POLICY "Managers and admins can create schedules"
  ON employee_schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can update schedules"
  ON employee_schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Admins can delete schedules"
  ON employee_schedules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for shift_swap_requests
CREATE POLICY "Users can view own swap requests"
  ON shift_swap_requests FOR SELECT
  USING (
    auth.uid() = requested_by OR
    auth.uid() = swap_with OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Users can create swap requests"
  ON shift_swap_requests FOR INSERT
  WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Managers can update swap requests"
  ON shift_swap_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- RLS Policies for employee_availability
CREATE POLICY "Users can view all availability"
  ON employee_availability FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own availability"
  ON employee_availability FOR ALL
  USING (auth.uid() = employee_id);

CREATE POLICY "Managers can manage any availability"
  ON employee_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

-- RLS Policies for schedule_templates
CREATE POLICY "Anyone can view schedule templates"
  ON schedule_templates FOR SELECT
  USING (true);

CREATE POLICY "Managers can create schedule templates"
  ON schedule_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers can update schedule templates"
  ON schedule_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Admins can delete schedule templates"
  ON schedule_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Triggers for updating updated_at
CREATE TRIGGER update_employee_schedules_updated_at
  BEFORE UPDATE ON employee_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shift_swap_requests_updated_at
  BEFORE UPDATE ON shift_swap_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_availability_updated_at
  BEFORE UPDATE ON employee_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_templates_updated_at
  BEFORE UPDATE ON schedule_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
