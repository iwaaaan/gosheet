'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import APITab from '@/components/tabs/APITab'
import AuthenticationTab from '@/components/tabs/AuthenticationTab'
import SettingsTab from '@/components/tabs/SettingsTab'
import { getProjectDetail } from './actions'

type TabType = 'api' | 'auth' | 'settings'

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const [activeTab, setActiveTab] = useState<TabType>('api')
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    setIsLoading(true)
    const data = await getProjectDetail(projectId)
    setProject(data)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-red-500">Project not found</div>
      </div>
    )
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'api', label: 'API' },
    { id: 'auth', label: 'Authentication' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">{project.name}</h2>
        <p className="text-gray-600 mt-1">Project ID: {project.id}</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'api' && <APITab projectId={projectId} />}
        {activeTab === 'auth' && <AuthenticationTab projectId={projectId} />}
        {activeTab === 'settings' && <SettingsTab project={project} onUpdate={loadProject} />}
      </div>
    </div>
  )
}
