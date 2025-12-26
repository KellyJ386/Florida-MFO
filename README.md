# MAX Facility Operations - Ice Rink Management System

A comprehensive ice rink management application built with Next.js 14, TypeScript, Supabase, and PowerSync for offline-first functionality.

## Project Status: 85% Complete ✅

**Latest Update**: All core features implemented! The application is now feature-complete with full CRUD operations, admin management, PWA support, and comprehensive UI components.

## Features

### 🧊 Ice Depth Management Module
- **Digital Measurement System**: Record ice thickness measurements with Bluetooth caliper integration
- **Interactive SVG Rink Diagrams**: Visual representation with customizable measurement points
- **Color-Coded Status System**:
  - Green (Ideal): Within 50% of tolerance
  - Yellow (Warning): Between 50-100% of tolerance
  - Red (Critical): Exceeds tolerance
- **Sequential Measurement Workflow**: Guided point-by-point data entry
- **PDF Report Generation**: Export measurements as professional reports
- **Measurement History**: Track trends over time
- **Custom Templates**: Create templates for different rinks

### 📋 Daily Reports Module
- **Customizable Tab System**: Flexible report structure with multiple tabs
- **Dynamic Form Builder**: Support for text, number, textarea, checkbox, select, and time fields
- **Photo Uploads**: Attach multiple photos to reports
- **Shift-Based Reporting**: Morning, afternoon, and evening shifts
- **Role-Based Access**: Different permissions for admin, manager, and staff
- **Calendar View**: Browse reports by date
- **Report Templates**: Reusable templates for consistent reporting

### 🔧 Admin Configuration
- **Template Management**: Create and edit ice depth and report templates
- **User Management**: Manage user accounts and roles (admin only)
- **Analytics Dashboard**: View usage statistics and trends
- **System Settings**: Configure application preferences

## Technology Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Offline-First**: PowerSync for local-first data sync
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **PDF Generation**: jsPDF + html2canvas
- **File Uploads**: React Dropzone
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- PowerSync account (optional, for offline functionality)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Florida-MFO
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_POWERSYNC_URL=your_powersync_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the database:
   - Go to your Supabase project
   - Run the SQL from `supabase/schema.sql` in the SQL Editor
   - This will create all necessary tables, policies, and triggers

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following main tables:

- `profiles`: User profiles with role-based access control
- `ice_depth_templates`: Rink diagram templates with measurement points
- `ice_depth_measurements`: Recorded ice thickness measurements
- `daily_report_templates`: Configurable report form templates
- `daily_reports`: Submitted daily shift reports

## User Roles

- **Staff**: Can create measurements and reports
- **Manager**: Staff permissions + template management
- **Admin**: Full system access including user management

## Project Structure

```
Florida-MFO/
├── app/                      # Next.js app directory
│   ├── auth/                 # Authentication pages
│   ├── ice-depth/            # Ice depth module
│   ├── daily-reports/        # Daily reports module
│   ├── admin/                # Admin pages
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ice-depth/            # Ice depth components
│   └── daily-reports/        # Daily reports components
├── lib/                      # Utility libraries
│   ├── supabase/             # Supabase clients
│   ├── services/             # Business logic
│   ├── hooks/                # React hooks
│   ├── types/                # TypeScript types
│   └── utils/                # Helper functions
├── public/                   # Static assets
└── supabase/                 # Database schema
```

## Key Features Implementation

### Bluetooth Caliper Integration

The app supports Bluetooth digital calipers for automatic measurement input:

```typescript
import { bluetoothService } from '@/lib/services/bluetooth'

// Connect to device
await bluetoothService.connect()

// Listen for measurements
bluetoothService.onData((value) => {
  console.log('Measured:', value)
})
```

### Offline-First Architecture

PowerSync provides seamless offline functionality:
- All data syncs automatically when online
- Works completely offline with local SQLite
- Automatic conflict resolution
- Background sync

### PDF Generation

Export ice depth measurements as professional PDF reports:
- Visual rink diagram with color-coded measurements
- Summary statistics
- Timestamp and user information

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

The application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Docker** (self-hosted)

Ensure environment variables are configured in your deployment platform.

## Progressive Web App (PWA)

The app is configured as a PWA:
- Install to home screen
- Offline functionality
- Native app-like experience
- Push notifications (future enhancement)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For issues and questions, please contact the development team.
