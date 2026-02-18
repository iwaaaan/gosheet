'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { deleteProject } from '@/app/dashboard/actions'

type SettingsTabProps = {
  project: {
    id: string
    name: string
    spreadsheet_id: string
  }
  onUpdate: () => void
}

export default function SettingsTab({ project, onUpdate }: SettingsTabProps) {
  const [name, setName] = useState(project.name)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createBrowserClient()
  const router = useRouter()

  const saveName = async () => {
    setIsSaving(true)

    await supabase
      .from('projects')
      .update({ name })
      .eq('id', project.id)

    onUpdate()
    setIsSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    const result = await deleteProject(project.id)

    if (result.success) {
      router.push('/dashboard')
    } else {
      alert(result.error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Project Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spreadsheet ID
            </label>
            <input
              type="text"
              value={project.spreadsheet_id}
              readOnly
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Spreadsheet ID cannot be changed
            </p>
          </div>

          <button
            onClick={saveName}
            disabled={isSaving || name === project.name}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">
          Once you delete a project, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete Project'}
        </button>
      </div>
    </div>
  )
}
