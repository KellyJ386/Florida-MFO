'use client'

import { useAuth } from './useAuth'

/**
 * Hook to get the current facility ID
 * In this application, the facility_id is the authenticated user's ID
 * This hook provides a semantic way to access facility context throughout the app
 */
export function useFacility() {
  const { user, loading } = useAuth()

  return {
    facilityId: user?.id || null,
    loading,
  }
}
