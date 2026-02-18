'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

type AuthType = 'none' | 'basic' | 'bearer'

export default function AuthenticationTab({ projectId }: { projectId: string }) {
  const [authType, setAuthType] = useState<AuthType>('none')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadAuthConfig()
  }, [projectId])

  const loadAuthConfig = async () => {
    const { data } = await supabase
      .from('project_auth')
      .select('*')
      .eq('project_id', projectId)
      .single()

    if (data) {
      setAuthType(data.auth_type as AuthType)
      if (data.auth_config) {
        setUsername(data.auth_config.username || '')
        setPassword(data.auth_config.password || '')
        setToken(data.auth_config.token || '')
      }
    }
  }

  const saveAuthConfig = async () => {
    setIsSaving(true)

    let authConfig = null
    if (authType === 'basic') {
      authConfig = { username, password }
    } else if (authType === 'bearer') {
      authConfig = { token }
    }

    await supabase
      .from('project_auth')
      .upsert({
        project_id: projectId,
        auth_type: authType,
        auth_config: authConfig,
      })

    setIsSaving(false)
  }

  return (
    <div className="max-w-2xl">
      <p className="text-gray-600 mb-6">
        Configure API authentication to secure your endpoints.
      </p>

      <div className="bg-white border rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Authentication Type
          </label>
          <select
            value={authType}
            onChange={(e) => setAuthType(e.target.value as AuthType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="none">None (Public)</option>
            <option value="basic">Basic Authentication</option>
            <option value="bearer">Bearer Token</option>
          </select>
        </div>

        {authType === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="password"
              />
            </div>
          </div>
        )}

        {authType === 'bearer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bearer Token
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="your-secret-token"
            />
            <p className="text-xs text-gray-500 mt-1">
              Clients must include: Authorization: Bearer your-secret-token
            </p>
          </div>
        )}

        <button
          onClick={saveAuthConfig}
          disabled={isSaving}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Authentication Settings'}
        </button>
      </div>
    </div>
  )
}
