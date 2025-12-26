'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/hooks/useAuth'
import { Plus, Edit, Trash2, Copy } from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/lib/types/database'

type IceDepthTemplate = Database['public']['Tables']['ice_depth_templates']['Row']

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<IceDepthTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()
  const { isManager } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('ice_depth_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      alert('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return
    }

    setDeleting(id)
    try {
      const { error } = await supabase
        .from('ice_depth_templates')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTemplates(templates.filter(t => t.id !== id))
      alert('Template deleted successfully')
    } catch (error: any) {
      console.error('Error deleting template:', error)
      alert(error.message || 'Failed to delete template')
    } finally {
      setDeleting(null)
    }
  }

  const handleDuplicate = async (template: IceDepthTemplate) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('ice_depth_templates')
        .insert({
          name: `${template.name} (Copy)`,
          rink_svg: template.rink_svg,
          measurement_points: template.measurement_points,
          created_by: user.id,
        })

      if (error) throw error

      alert('Template duplicated successfully')
      fetchTemplates()
    } catch (error: any) {
      console.error('Error duplicating template:', error)
      alert(error.message || 'Failed to duplicate template')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ice Depth Templates</h1>
            <p className="text-gray-600 mt-1">Manage rink diagrams and measurement points</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/ice-depth"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Back
            </Link>
            {isManager && (
              <Link
                href="/ice-depth/templates/new"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                New Template
              </Link>
            )}
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No templates yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first ice depth template to start measuring ice thickness
              </p>
              {isManager && (
                <Link
                  href="/ice-depth/templates/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  Create First Template
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {(template.measurement_points as any[]).length} measurement points
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <svg
                      viewBox="0 0 800 400"
                      className="w-full h-32"
                      dangerouslySetInnerHTML={{ __html: template.rink_svg }}
                    />
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/ice-depth/measure?template=${template.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Use Template
                    </Link>
                    {isManager && (
                      <>
                        <Link
                          href={`/ice-depth/templates/${template.id}/edit`}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(template)}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          disabled={deleting === template.id}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
