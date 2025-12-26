'use client'

import { useState } from 'react'
import type { ReportTab, ReportField } from '@/lib/types/database'
import { Plus, Trash2, Edit2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'

interface TemplateBuilderProps {
  tabs: ReportTab[]
  onTabsChange: (tabs: ReportTab[]) => void
}

export function TemplateBuilder({ tabs, onTabsChange }: TemplateBuilderProps) {
  const [editingTab, setEditingTab] = useState<ReportTab | null>(null)
  const [expandedTab, setExpandedTab] = useState<string | null>(tabs[0]?.id || null)

  const addTab = () => {
    const newTab: ReportTab = {
      id: `tab-${Date.now()}`,
      title: 'New Tab',
      fields: [],
    }
    onTabsChange([...tabs, newTab])
    setEditingTab(newTab)
    setExpandedTab(newTab.id)
  }

  const updateTab = (updatedTab: ReportTab) => {
    onTabsChange(tabs.map(t => t.id === updatedTab.id ? updatedTab : t))
    setEditingTab(null)
  }

  const deleteTab = (id: string) => {
    if (confirm('Delete this tab and all its fields?')) {
      onTabsChange(tabs.filter(t => t.id !== id))
      if (expandedTab === id) setExpandedTab(null)
    }
  }

  const addField = (tabId: string) => {
    const newField: ReportField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
    }

    onTabsChange(tabs.map(tab => {
      if (tab.id === tabId) {
        return { ...tab, fields: [...tab.fields, newField] }
      }
      return tab
    }))
  }

  const updateField = (tabId: string, updatedField: ReportField) => {
    onTabsChange(tabs.map(tab => {
      if (tab.id === tabId) {
        return {
          ...tab,
          fields: tab.fields.map(f => f.id === updatedField.id ? updatedField : f)
        }
      }
      return tab
    }))
  }

  const deleteField = (tabId: string, fieldId: string) => {
    if (confirm('Delete this field?')) {
      onTabsChange(tabs.map(tab => {
        if (tab.id === tabId) {
          return { ...tab, fields: tab.fields.filter(f => f.id !== fieldId) }
        }
        return tab
      }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tabs & Fields</h3>
        <button
          onClick={addTab}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Tab
        </button>
      </div>

      {tabs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No tabs yet</p>
          <button
            onClick={addTab}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Tab
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="border border-gray-200 rounded-lg bg-white">
              {/* Tab Header */}
              <div className="p-4 flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400" />

                {editingTab?.id === tab.id ? (
                  <input
                    type="text"
                    value={editingTab.title}
                    onChange={(e) => setEditingTab({ ...editingTab, title: e.target.value })}
                    className="flex-1 px-3 py-1 border border-blue-500 rounded focus:outline-none"
                    autoFocus
                    onBlur={() => updateTab(editingTab)}
                    onKeyPress={(e) => e.key === 'Enter' && updateTab(editingTab)}
                  />
                ) : (
                  <>
                    <div className="flex-1 font-medium">{tab.title}</div>
                    <span className="text-sm text-gray-500">{tab.fields.length} fields</span>
                  </>
                )}

                <button
                  onClick={() => setExpandedTab(expandedTab === tab.id ? null : tab.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  {expandedTab === tab.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                {editingTab?.id !== tab.id && (
                  <>
                    <button
                      onClick={() => setEditingTab(tab)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTab(tab.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Tab Fields */}
              {expandedTab === tab.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="space-y-3">
                    {tab.fields.map((field) => (
                      <FieldEditor
                        key={field.id}
                        field={field}
                        onUpdate={(updated) => updateField(tab.id, updated)}
                        onDelete={() => deleteField(tab.id, field.id)}
                      />
                    ))}

                    <button
                      onClick={() => addField(tab.id)}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      + Add Field
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function FieldEditor({
  field,
  onUpdate,
  onDelete,
}: {
  field: ReportField
  onUpdate: (field: ReportField) => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedField, setEditedField] = useState(field)

  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'number', label: 'Number' },
    { value: 'textarea', label: 'Text Area' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'select', label: 'Dropdown' },
    { value: 'time', label: 'Time' },
  ]

  const handleSave = () => {
    onUpdate(editedField)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedField(field)
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
        <GripVertical className="w-4 h-4 text-gray-400" />
        <div className="flex-1">
          <div className="font-medium text-sm">{field.label}</div>
          <div className="text-xs text-gray-500">
            {fieldTypes.find(t => t.value === field.type)?.label}
            {field.required && ' • Required'}
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white border-2 border-blue-500 rounded-lg space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Label</label>
          <input
            type="text"
            value={editedField.label}
            onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Field Type</label>
          <select
            value={editedField.type}
            onChange={(e) => setEditedField({ ...editedField, type: e.target.value as any })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {fieldTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {editedField.type === 'select' && (
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Options (comma-separated)
          </label>
          <input
            type="text"
            value={editedField.options?.join(', ') || ''}
            onChange={(e) => setEditedField({
              ...editedField,
              options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Option 1, Option 2, Option 3"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`required-${field.id}`}
          checked={editedField.required}
          onChange={(e) => setEditedField({ ...editedField, required: e.target.checked })}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
          Required field
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
