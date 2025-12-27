# Max Facility Operations (MFO)

## Product Requirements Document

### Ice Depth Management & Daily Reports Modules

**Version:** 2.0  
**Date:** December 26, 2024  
**Author:** Kelly Smith, Associate Director of Recreation  
**Target Platform:** Claude Code Development

-----

## Executive Summary

This PRD covers the specifications for all modules of the Max Facility Operations (MFO) SaaS platform designed to digitize traditional paper-based ice rink operations and provide ice facility managers with modern, mobile-first tools that work offline.

**Technology Stack:**

- **Frontend:** Next.js 14+ (App Router) with TypeScript
- **Backend:** Supabase (PostgreSQL with Row-Level Security)
- **Offline-First:** PowerSync for local SQLite sync
- **Deployment:** Vercel (auto-deploy from GitHub)
- **Development Flow:** Claude Code → GitHub → Vercel

-----

## Modules Overview

### ✅ **Completed Modules:**
1. Ice Depth Management Module
2. Daily Reports Module  
3. Employee Schedule Module
4. Admin Panel

### ❌ **Missing Modules (To Be Built):**
1. Incident & Accident Reporting Module
2. Ice Operations Module (Ice Make, Blade Changes, Circle Checks, End of Day)
3. Refrigeration Plant Monitoring Module
4. Air Quality Compliance Module

-----

## 3. Incident & Accident Reporting Module

### 3.1 Module Overview

**Purpose:** Comprehensive incident and accident documentation system with interactive body diagram, immutable record-keeping with limited edit window.

**Key Value Propositions:**

- Digital replacement for paper incident forms
- Interactive body diagram for precise injury location
- Immediate manager notifications for severe incidents
- Immutable records after edit window
- Facility floor plan pin-pointing
- Role-based access controls

**Target Users:**

- All facility staff (incident reporters)
- Facility Managers (reviewers/approvers)
- Safety Officers (analytics/compliance)

### 3.2 Interactive Body Diagram

**8-Region Body Map:**

1. Head
2. Neck
3. Upper Body (chest/back/shoulders)
4. Lower Body (abdomen/hips)
5. Left Arm (shoulder to hand)
6. Right Arm (shoulder to hand)
7. Left Leg (hip to foot)
8. Right Leg (hip to foot)

**Front and Back Views:**

- Dual SVG diagrams (front view + back view)
- Click-to-select regions
- Multiple regions can be selected
- Selected regions highlight in red
- Mobile-friendly touch targets (minimum 44px)

### 3.3 Form Structure

**Section 1: Incident Information**

- Date of Incident (date picker) *required
- Time of Incident (time picker) *required
- Location (facility floor plan with pin-drop OR dropdown) *required
- Activity at Time of Incident (dropdown: Public Skate, Hockey Game, Learn to Skate, etc.)
- Type of Incident *required:
  - Skater-to-Skater Collision
  - Skate Blade Cut
  - Puck Strike
  - Head Injury/Concussion
  - Fall on Ice
  - Board/Glass Impact
  - Zamboni-Related
  - Equipment Failure
  - Dental Injury
  - Eye Injury

**Section 2: Injured Party Information**

- Full Name *required
- Age *required
- Gender
- Phone Number *required
- Email Address
- Emergency Contact Name
- Emergency Contact Phone

**Section 3: Injury Details**

- Interactive Body Diagram (front + back views)
- Injury Description per Selected Body Part *required
- Severity Level (Minor, Moderate, Serious, Critical) *required
- Was bleeding present? (Yes/No)
- Loss of consciousness? (Yes/No)
- Detailed Description *required

**Section 4: Treatment Provided**

- First Aid Provided? (Yes/No)
- Treatment Details
- EMS Called? (Yes/No)
- Hospital Transport? (Yes/No)

**Section 5: Report Completion**

- Report Completed By (auto-populated) *required
- Digital Signature *required
- Manager Review (conditional after submission)

### 3.4 Immutability & Edit Window

**Edit Window:** 15-30 minutes (configurable)

**During Edit Window:**
- Submitter can edit all fields
- Warning: "Edit window expires in X minutes"
- All edits logged in audit trail

**After Edit Window:**
- Incident locked (read-only)
- Manager override available (with reason)
- Comment append only

### 3.5 Auto-Notifications

| Severity     | Auto-Notify   | Recipients                        | Method              |
|--------------|---------------|-----------------------------------|---------------------|
| **Critical** | Immediate     | GM, Facility Manager, Safety      | SMS + Email + In-App|
| **Serious**  | Within 15 min | Facility Manager, Safety Officer  | Email + In-App      |
| **Moderate** | Within 1 hour | Facility Manager                  | Email + In-App      |
| **Minor**    | Daily digest  | Facility Manager                  | Email               |

### 3.6 Database Schema

```sql
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id),
  
  -- Incident Information
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,
  location TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  
  -- Injured Party
  injured_name TEXT NOT NULL,
  injured_age INTEGER NOT NULL,
  injured_phone TEXT NOT NULL,
  
  -- Injury Details
  body_regions_selected TEXT[],
  injury_descriptions JSONB,
  severity TEXT NOT NULL,
  bleeding_present BOOLEAN DEFAULT false,
  loss_of_consciousness BOOLEAN DEFAULT false,
  detailed_description TEXT NOT NULL,
  
  -- Treatment
  first_aid_provided BOOLEAN,
  ems_called BOOLEAN,
  hospital_transport BOOLEAN,
  
  -- Report Metadata
  reported_by UUID NOT NULL REFERENCES users(id),
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  reporter_signature TEXT,
  
  -- Status
  status TEXT DEFAULT 'submitted',
  locked_at TIMESTAMPTZ,
  
  -- Audit Trail
  edit_history JSONB,
  comments JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

-----

## 4. Ice Operations Module

### 4.1 Module Overview

**Purpose:** Comprehensive ice resurfacing operations tracking with 4-tab structure.

**Tabs:**
1. Ice Make Log
2. Blade Change Log
3. Circle Check
4. End of Day Report

**Target Users:**
- Ice Maintenance Technicians
- Facility Managers
- Supervisors

### 4.2 Tab 1: Ice Make Log

**Auto-Populated:**
- Facility, Date, Time, Operator Name

**User Input:**

| Field           | Type               | Description                     |
|-----------------|--------------------|---------------------------------|
| Machine *       | Dropdown           | Select from active machines     |
| Rink *          | Dropdown           | Select rink                     |
| Type *          | Toggle (Wet/Dry)   | Wet cut or dry cut              |
| Water Used      | Number (gallons)   | Visible only if Wet             |
| Snow in Tank *  | Percentage (0-100%)| Snow tank fullness              |
| Battery Start % | Number             | Electric machines only          |
| Battery Finish %| Number             | Electric machines only          |
| Notes           | Text area          | Observations (max 500 chars)    |

### 4.3 Tab 2: Blade Change Log

**User Input:**

- Machine * (dropdown)
- Who Performed Change * (auto-populated)
- Notes (text area)

**Critical Feature: 7-Day Blade Change Alert**

When blade changed:
1. Alert created immediately for ALL operators
2. Alert visible for 7 days
3. Alert locations: Ice Make Log page, Dashboard, Mobile push

**Alert Message:**
```
⚠️ FRESH BLADE ALERT - [Machine Name]
Blade changed on [Date] at [Time] by [Operator Name]
Exercise caution on first few cuts - fresh blade!
```

### 4.4 Tab 3: Circle Check

**30-Checkpoint System** (configurable per machine type)

Example Gas Machine Checkpoints:
1. Engine oil level
2. Coolant level
3. Hydraulic fluid level
4. Fuel level
5. Tire pressure
6. Blade condition
7. Snow tank empty
8. Water tank filled
9. Lights functioning
10. Brakes functional
... (30 total)

**Failed Item Handling:**
- Failed checkpoints highlighted in red
- Auto-notify ALL management via email
- Machine NOT blocked (advisory only)

### 4.5 Tab 4: End of Day Report

**Auto-Generated Summary:**
- Total ice makes
- Total water used
- Average snow accumulation
- Blade changes list
- Failed circle checks

**User Input:**
- General observations
- Issues encountered
- Maintenance needed
- Staff notes for next shift

### 4.6 Database Schema

```sql
CREATE TABLE ice_makes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL,
  machine_id UUID NOT NULL,
  rink_id UUID NOT NULL,
  operator_id UUID NOT NULL,
  
  make_date DATE NOT NULL,
  make_time TIME NOT NULL,
  type TEXT NOT NULL,
  water_used_gallons DECIMAL(5,1),
  snow_percentage INTEGER,
  battery_start_percentage INTEGER,
  battery_finish_percentage INTEGER,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blade_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL,
  machine_id UUID NOT NULL,
  changed_by UUID NOT NULL,
  
  change_date DATE NOT NULL,
  change_time TIME NOT NULL,
  notes TEXT,
  
  alert_expires_at TIMESTAMPTZ,
  acknowledged_by UUID[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE circle_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL,
  machine_id UUID NOT NULL,
  operator_id UUID NOT NULL,
  
  check_date DATE NOT NULL,
  check_time TIME NOT NULL,
  
  checkpoints JSONB NOT NULL,
  total_checkpoints INTEGER,
  passed_checkpoints INTEGER,
  failed_checkpoints INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

-----

## 5. Refrigeration Plant Monitoring Module

### 5.1 Module Overview

**Purpose:** Monitor ice rink refrigeration system with compliance tracking for Ontario Regulation 219/01.

**Key Features:**
- Support 15-20 compressors per facility
- Per-equipment configurable thresholds
- Ontario Reg 219/01 compliance (3 inspections per 8-hour period)
- TSSA inspection readiness

### 5.2 System Monitoring

**High-Side System:**
- Discharge Pressure (normal: 180-220 psig)
- Discharge Temperature (normal: 100-130°F)
- Liquid Line Temperature (normal: 85-95°F)

**Low-Side System:**
- Suction Pressure (normal: 8-25 psig)
- Suction Temperature (normal: 10-30°F)

**Brine System:**
- Supply Temperature (normal: 16-20°F)
- Return Temperature (normal: 20-24°F)
- Flow Rate (GPM)
- Brine Concentration (22-25%)

**Compressor Status (Per Compressor):**
- Running (Yes/No)
- Load Percentage
- Amperage
- Oil Level, Pressure, Temperature
- Vibration/Noise Level

**Alert Thresholds:**
- Per-equipment configuration
- Color-coded: 🟢 Green | 🟡 Yellow | 🔴 Red
- Auto email/SMS for critical

### 5.3 Compliance Requirements

**Ontario Reg 219/01:**
- 3 inspections per 8-hour period
- Digital format (INK only equivalent)
- Corrections logged (no erasures)
- Authorized operators only

### 5.4 Database Schema

```sql
CREATE TABLE refrigeration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL,
  operator_id UUID NOT NULL,
  
  log_date DATE NOT NULL,
  log_time TIME NOT NULL,
  inspection_number INTEGER,
  
  -- Readings
  discharge_pressure DECIMAL(5,1),
  discharge_temp DECIMAL(5,1),
  suction_pressure DECIMAL(5,1),
  suction_temp DECIMAL(5,1),
  brine_supply_temp DECIMAL(5,1),
  brine_return_temp DECIMAL(5,1),
  
  -- Compressor data
  compressor_data JSONB,
  
  -- Compliance
  operator_certificate_number TEXT,
  operator_signature TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE compressor_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL,
  compressor_number INTEGER NOT NULL,
  compressor_name TEXT NOT NULL,
  
  -- Per-equipment thresholds
  discharge_pressure_min DECIMAL(5,1),
  discharge_pressure_max DECIMAL(5,1),
  suction_pressure_min DECIMAL(5,1),
  suction_pressure_max DECIMAL(5,1),
  
  is_active BOOLEAN DEFAULT true
);
```

-----

## 6. Air Quality Compliance Module

### 6.1 Module Overview

**Purpose:** Monitor indoor air quality for CO, NO₂, CO₂ with compliance reporting and automatic incident triggering.

### 6.2 Testing Requirements

| Gas                        | Action Level      | Emergency Level    | OSHA Limit    |
|----------------------------|-------------------|--------------------|---------------|
| **CO (Carbon Monoxide)**   | 15-29 ppm         | ≥30 ppm            | <30 ppm       |
| **NO₂ (Nitrogen Dioxide)** | 0.3-0.49 ppm      | ≥0.5 ppm           | <0.5 ppm      |
| **CO₂ (Carbon Dioxide)**   | 1,500 ppm warning | 5,000 ppm critical | <5,000 ppm    |

**Testing Frequency:**
- Minimum: 2 times weekdays, 1 time weekend days
- Post-resurfacing: 20 minutes after
- Locations: Rink Level, Timekeeper's Box, Dressing Rooms
- Both instant AND 1-hour average readings

### 6.3 Alert System

**Multi-Channel Alerts:**
- SMS (critical/emergency)
- Email (all levels)
- In-app notifications
- Push notifications

**Auto-Trigger Incident Reports:**
- If CO ≥30 ppm OR NO₂ ≥0.5 ppm → Auto-create incident
- Pre-populated with reading data
- Staff completes additional details

### 6.4 Database Schema

```sql
CREATE TABLE air_quality_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL,
  sensor_id UUID,
  tester_id UUID NOT NULL,
  
  reading_date DATE NOT NULL,
  reading_time TIME NOT NULL,
  location TEXT NOT NULL,
  
  -- Readings
  co_instant DECIMAL(5,2),
  co_1hr_avg DECIMAL(5,2),
  no2_instant DECIMAL(5,3),
  no2_1hr_avg DECIMAL(5,3),
  co2_instant INTEGER,
  co2_1hr_avg INTEGER,
  
  -- Status
  status TEXT,
  incident_triggered BOOLEAN DEFAULT false,
  incident_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE air_quality_sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL,
  sensor_name TEXT NOT NULL,
  sensor_type TEXT,
  
  last_calibration_date DATE,
  next_calibration_due DATE,
  calibration_frequency_days INTEGER DEFAULT 30,
  
  is_active BOOLEAN DEFAULT true
);
```

-----

## Development Priority

### Priority 1: Incident Reporting (Critical for Safety)
- Interactive body diagram
- Form structure
- Auto-notifications
- Immutability logic

### Priority 2: Ice Operations (High Usage)
- Ice Make Log
- Blade Change with 7-day alerts
- Circle Check 30-point system
- End of Day Report

### Priority 3: Air Quality (Compliance Critical)
- Manual entry forms
- Auto-incident triggering
- Multi-channel alerts
- Compliance reporting

### Priority 4: Refrigeration (Compliance)
- Monitoring forms
- Per-equipment thresholds
- Ontario Reg 219/01 compliance
- TSSA readiness

-----

**END OF DOCUMENT**
