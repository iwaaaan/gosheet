'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

type Endpoint = {
  id: string
  sheet_name: string
  is_get_enabled: boolean
  is_post_enabled: boolean
  is_put_enabled: boolean
  is_delete_enabled: boolean
}

export default function APITab({ projectId }: { projectId: string }) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadEndpoints()
  }, [projectId])

  const loadEndpoints = async () => {
    const { data } = await supabase
      .from('endpoints')
      .select('*')
      .eq('project_id', projectId)
      .order('sheet_name')

    if (data) {
      setEndpoints(data)
    }
    setIsLoading(false)
  }

  const toggleMethod = async (endpointId: string, method: keyof Endpoint, currentValue: boolean) => {
    await supabase
      .from('endpoints')
      .update({ [method]: !currentValue })
      .eq('id', endpointId)

    loadEndpoints()
  }

  const getApiUrl = (sheetName: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/api/v1/${projectId}/${encodeURIComponent(sheetName)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return <div className="text-gray-500">Loading endpoints...</div>
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-4">
        Manage your API endpoints. Toggle HTTP methods for each sheet.
      </p>

      {endpoints.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No sheets found in this project</p>
        </div>
      ) : (
        <div className="space-y-4">
          {endpoints.map(endpoint => (
            <div key={endpoint.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {endpoint.sheet_name}
                </h3>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  API Endpoint
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={getApiUrl(endpoint.sheet_name)}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(getApiUrl(endpoint.sheet_name))}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  Enabled Methods
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['is_get_enabled', 'is_post_enabled', 'is_put_enabled', 'is_delete_enabled'] as const).map(method => {
                    const methodName = method.replace('is_', '').replace('_enabled', '').toUpperCase()
                    return (
                      <button
                        key={method}
                        onClick={() => toggleMethod(endpoint.id, method, endpoint[method])}
                        className={`
                          px-4 py-2 rounded-md border-2 font-medium text-sm transition-colors
                          ${
                            endpoint[method]
                              ? 'bg-green-50 border-green-500 text-green-700'
                              : 'bg-gray-50 border-gray-300 text-gray-500'
                          }
                        `}
                      >
                        {methodName}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
