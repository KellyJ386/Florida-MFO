'use client'

import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variants = {
    danger: {
      icon: 'bg-red-100 text-red-600',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: 'bg-yellow-100 text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 rounded-full p-3 ${variants[variant].icon}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600">{message}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg ${variants[variant].button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
