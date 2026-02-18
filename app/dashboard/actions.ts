'use server'

import { createServerClient } from '@/lib/supabase/server'
import { getSheetNames } from '@/lib/google-sheets'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const spreadsheetUrl = formData.get('spreadsheetUrl') as string

  // Extract spreadsheet ID from URL
  const spreadsheetIdMatch = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!spreadsheetIdMatch) {
    return { error: 'Invalid Google Sheets URL' }
  }

  const spreadsheetId = spreadsheetIdMatch[1]

  // Get user's refresh token from session
  const { data: session } = await supabase.auth.getSession()
  const refreshToken = session.session?.provider_refresh_token

  if (!refreshToken) {
    return { error: 'No Google refresh token found. Please re-authenticate.' }
  }

  try {
    // Get all sheet names from spreadsheet
    const sheetNames = await getSheetNames(spreadsheetId, refreshToken)

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        spreadsheet_id: spreadsheetId,
        google_refresh_token: refreshToken,
      })
      .select()
      .single()

    if (projectError) {
      return { error: projectError.message }
    }

    // Create endpoints for each sheet
    const endpoints = sheetNames.map(sheetName => ({
      project_id: project.id,
      sheet_name: sheetName,
      is_get_enabled: true,
      is_post_enabled: false,
      is_put_enabled: false,
      is_delete_enabled: false,
    }))

    await supabase.from('endpoints').insert(endpoints)

    // Create default auth config (none)
    await supabase.from('project_auth').insert({
      project_id: project.id,
      auth_type: 'none',
    })

    revalidatePath('/dashboard')
    return { success: true, projectId: project.id }
  } catch (error: any) {
    return { error: error.message || 'Failed to create project' }
  }
}

export async function deleteProject(projectId: string) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
