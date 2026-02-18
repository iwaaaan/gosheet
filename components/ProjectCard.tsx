import Link from 'next/link'

type ProjectCardProps = {
  project: {
    id: string
    name: string
    created_at: string
    endpoint_count?: number
  }
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/dashboard/${project.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">📊</div>
          <div className="text-xs text-gray-500">
            {new Date(project.created_at).toLocaleDateString()}
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {project.name}
        </h3>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-1">📋</span>
          <span>{project.endpoint_count || 0} endpoints</span>
        </div>
      </div>
    </Link>
  )
}
