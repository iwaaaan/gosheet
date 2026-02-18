import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/client'
import { transformRowsToJSON, transformJSONToRow, findRowIndexById } from '@/lib/transformer'
import { readSheet, appendToSheet, updateRow, deleteRow } from '@/lib/google-sheets'

type RouteContext = {
  params: {
    projectId: string
    sheetName: string
  }
}

/**
 * Verify API authentication
 */
async function verifyAuth(request: NextRequest, projectId: string) {
  const supabase = createServiceClient()

  // Get project auth config
  const { data: authConfig } = await supabase
    .from('project_auth')
    .select('auth_type, auth_config')
    .eq('project_id', projectId)
    .single()

  if (!authConfig || authConfig.auth_type === 'none') {
    return true
  }

  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    return false
  }

  if (authConfig.auth_type === 'bearer') {
    const token = authHeader.replace('Bearer ', '')
    return token === authConfig.auth_config?.token
  }

  if (authConfig.auth_type === 'basic') {
    const base64Credentials = authHeader.replace('Basic ', '')
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const [username, password] = credentials.split(':')

    return (
      username === authConfig.auth_config?.username &&
      password === authConfig.auth_config?.password
    )
  }

  return false
}

/**
 * GET - Fetch sheet data as JSON
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { projectId, sheetName } = params
    const supabase = createServiceClient()

    // Verify authentication
    const isAuthorized = await verifyAuth(request, projectId)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project metadata
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('spreadsheet_id, google_refresh_token')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if GET is enabled for this endpoint
    const { data: endpoint } = await supabase
      .from('endpoints')
      .select('is_get_enabled')
      .eq('project_id', projectId)
      .eq('sheet_name', sheetName)
      .single()

    if (!endpoint?.is_get_enabled) {
      return NextResponse.json({ error: 'GET method not allowed' }, { status: 405 })
    }

    // Fetch data from Google Sheets
    const rows = await readSheet(
      project.spreadsheet_id,
      sheetName,
      project.google_refresh_token!
    )

    // Transform to JSON
    const jsonData = transformRowsToJSON(rows, sheetName)

    return NextResponse.json(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

/**
 * POST - Append new row to sheet
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { projectId, sheetName } = params
    const supabase = createServiceClient()

    // Verify authentication
    const isAuthorized = await verifyAuth(request, projectId)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project metadata
    const { data: project } = await supabase
      .from('projects')
      .select('spreadsheet_id, google_refresh_token')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if POST is enabled
    const { data: endpoint } = await supabase
      .from('endpoints')
      .select('is_post_enabled')
      .eq('project_id', projectId)
      .eq('sheet_name', sheetName)
      .single()

    if (!endpoint?.is_post_enabled) {
      return NextResponse.json({ error: 'POST method not allowed' }, { status: 405 })
    }

    // Get request body
    const body = await request.json()
    const data = body[sheetName] || body

    // Read current sheet to get headers
    const rows = await readSheet(
      project.spreadsheet_id,
      sheetName,
      project.google_refresh_token!
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Sheet has no headers' }, { status: 400 })
    }

    const headers = rows[0].map((h: any) => h?.toString().trim() || '')

    // Transform data to row format
    const rowValues = transformJSONToRow(data, headers)

    // Append to sheet
    await appendToSheet(
      project.spreadsheet_id,
      sheetName,
      rowValues,
      project.google_refresh_token!
    )

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Failed to create row' }, { status: 500 })
  }
}

/**
 * PUT - Update existing row by ID
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { projectId, sheetName } = params
    const supabase = createServiceClient()

    // Verify authentication
    const isAuthorized = await verifyAuth(request, projectId)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project metadata
    const { data: project } = await supabase
      .from('projects')
      .select('spreadsheet_id, google_refresh_token')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if PUT is enabled
    const { data: endpoint } = await supabase
      .from('endpoints')
      .select('is_put_enabled')
      .eq('project_id', projectId)
      .eq('sheet_name', sheetName)
      .single()

    if (!endpoint?.is_put_enabled) {
      return NextResponse.json({ error: 'PUT method not allowed' }, { status: 405 })
    }

    // Get request body
    const body = await request.json()
    const data = body[sheetName] || body
    const rowId = data.id

    if (!rowId) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Read current sheet to get headers
    const rows = await readSheet(
      project.spreadsheet_id,
      sheetName,
      project.google_refresh_token!
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Sheet has no headers' }, { status: 400 })
    }

    const headers = rows[0].map((h: any) => h?.toString().trim() || '')
    const rowValues = transformJSONToRow(data, headers)

    // Update row
    await updateRow(
      project.spreadsheet_id,
      sheetName,
      rowId,
      rowValues,
      project.google_refresh_token!
    )

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PUT error:', error)
    return NextResponse.json({ error: 'Failed to update row' }, { status: 500 })
  }
}

/**
 * DELETE - Delete row by ID
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { projectId, sheetName } = params
    const { searchParams } = new URL(request.url)
    const rowId = searchParams.get('id')

    if (!rowId) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Verify authentication
    const isAuthorized = await verifyAuth(request, projectId)
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get project metadata
    const { data: project } = await supabase
      .from('projects')
      .select('spreadsheet_id, google_refresh_token')
      .eq('id', projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if DELETE is enabled
    const { data: endpoint } = await supabase
      .from('endpoints')
      .select('is_delete_enabled')
      .eq('project_id', projectId)
      .eq('sheet_name', sheetName)
      .single()

    if (!endpoint?.is_delete_enabled) {
      return NextResponse.json({ error: 'DELETE method not allowed' }, { status: 405 })
    }

    // Delete row
    await deleteRow(
      project.spreadsheet_id,
      sheetName,
      parseInt(rowId),
      project.google_refresh_token!
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete row' }, { status: 500 })
  }
}

/**
 * OPTIONS - CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
