import { PowerSyncDatabase } from '@powersync/web'
import { createClient } from '@/lib/supabase/client'

// Define the schema for PowerSync
export const schema = {
  profiles: {
    id: 'TEXT PRIMARY KEY',
    email: 'TEXT',
    full_name: 'TEXT',
    role: 'TEXT',
    created_at: 'TEXT',
    updated_at: 'TEXT',
  },
  ice_depth_templates: {
    id: 'TEXT PRIMARY KEY',
    name: 'TEXT',
    rink_svg: 'TEXT',
    measurement_points: 'TEXT',
    created_by: 'TEXT',
    created_at: 'TEXT',
    updated_at: 'TEXT',
  },
  ice_depth_measurements: {
    id: 'TEXT PRIMARY KEY',
    template_id: 'TEXT',
    recorded_by: 'TEXT',
    measurement_date: 'TEXT',
    measurements: 'TEXT',
    notes: 'TEXT',
    created_at: 'TEXT',
    updated_at: 'TEXT',
  },
  daily_report_templates: {
    id: 'TEXT PRIMARY KEY',
    name: 'TEXT',
    tabs: 'TEXT',
    created_by: 'TEXT',
    created_at: 'TEXT',
    updated_at: 'TEXT',
  },
  daily_reports: {
    id: 'TEXT PRIMARY KEY',
    template_id: 'TEXT',
    report_date: 'TEXT',
    shift: 'TEXT',
    submitted_by: 'TEXT',
    data: 'TEXT',
    photos: 'TEXT',
    created_at: 'TEXT',
    updated_at: 'TEXT',
  },
}

// PowerSync connector for Supabase
class SupabaseConnector {
  private supabase = createClient()

  async fetchCredentials() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession()

    if (!session) {
      throw new Error('No session available')
    }

    return {
      endpoint: process.env.NEXT_PUBLIC_POWERSYNC_URL!,
      token: session.access_token,
    }
  }

  async uploadData(database: PowerSyncDatabase) {
    // Get all pending changes
    const changes = await database.getPendingCrudOperations()

    for (const change of changes) {
      const { table, op, data } = change

      try {
        if (op === 'INSERT' || op === 'UPDATE') {
          await this.supabase.from(table).upsert(data)
        } else if (op === 'DELETE') {
          await this.supabase.from(table).delete().eq('id', data.id)
        }

        // Mark as uploaded
        await database.removePendingCrudOperation(change.id)
      } catch (error) {
        console.error('Upload error:', error)
      }
    }
  }
}

let powerSyncInstance: PowerSyncDatabase | null = null

export async function getPowerSync() {
  if (powerSyncInstance) {
    return powerSyncInstance
  }

  const connector = new SupabaseConnector()

  powerSyncInstance = new PowerSyncDatabase({
    schema,
    database: {
      dbFilename: 'max-facility-ops.db',
    },
  })

  await powerSyncInstance.init()

  // Connect to PowerSync backend
  const credentials = await connector.fetchCredentials()
  await powerSyncInstance.connect(credentials)

  // Set up upload handler
  powerSyncInstance.registerUploadHandler(async () => {
    await connector.uploadData(powerSyncInstance!)
  })

  return powerSyncInstance
}

export function usePowerSync() {
  return getPowerSync()
}
