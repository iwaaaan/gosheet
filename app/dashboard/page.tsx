'use client'

import { useState, useEffect } from 'react'
import ProjectCard from '@/components/ProjectCard'
import NewProjectModal from '@/components/NewProjectModal'
import { getProjects } from './actions'

type Project = {
  id: string
  name: string
  created_at: string
  endpoint_count?: number
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoading(true)
    const projectsData = await getProjects()
    setProjects(projectsData)
    setIsLoading(false)
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
            <p className="text-gray-600 mt-2">Manage your Google Sheets API projects</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
          >
            + New Project
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by connecting your first Google Sheet
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          loadProjects()
        }}
      />
    </>
  )
}
