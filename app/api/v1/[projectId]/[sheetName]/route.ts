import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { projects, endpoints, projectAuth } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { transformRowsToJSON, transformJSONToRow } from '@/lib/transformer'
import { readSheet, appendToSheet, updateRow, deleteRow } from '@/lib/google-sheets'

type RouteContext = {
  params: {
    projectId: string
    sheetName: string
  }
}

async function verifyAuth(request: NextRequest, projectId: string) {
  const config = await db.query.projectAuth.findFirst({
    where: eq(projectAuth.projectId, projectId)
  })

  if (!config || config.authType === 'none') {
    return true
  }

  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return false

  if (config.authType === 'bearer') {
    const token = authHeader.replace('Bearer ', '')
    return token === (config.authConfig as any)?.token
  }

  if (config.authType === 'basic') {
    const base64Credentials = authHeader.replace('Basic ', '')
    try {
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
      const [username, password] = credentials.split(':')
      return (
        username === (config.authConfig as any)?.username &&
        password === (config.authConfig as any)?.password
      )
    } catch {
      return false
    }
  }

  return false
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { projectId, sheetName } = params

    if (!(await verifyAuth(request, projectId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId)
    })

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const endpoint = await db.query.endpoints.findFirst({
      where: and(
        eq(endpoints.projectId, projectId),
        eq(endpoints.sheetName, sheetName)
      )
    })

    if (!endpoint?.isGetEnabled) {
      return NextResponse.json({ error: 'GET method not allowed' }, { status: 405 })
    }

    const rows = await readSheet(project.spreadsheetId, sheetName)
    const jsonData = transformRowsToJSON(rows, sheetName)

    return NextResponse.json(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { projectId, sheetName } = params

    if (!(await verifyAuth(request, projectId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId)
    })

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const endpoint = await db.query.endpoints.findFirst({
      where: and(
        eq(endpoints.projectId, projectId),
        eq(endpoints.sheetName, sheetName)
      )
    })

    if (!endpoint?.isPostEnabled) {
      return NextResponse.json({ error: 'POST method not allowed' }, { status: 405 })
    }

    const body = await request.json()
    const data = body[sheetName] || body

    const rows = await readSheet(project.spreadsheetId, sheetName)
    if (rows.length === 0) return NextResponse.json({ error: 'Sheet has no headers' }, { status: 400 })

    const headers = rows[0].map((h: any) => h?.toString().trim() || '')
    const rowValues = transformJSONToRow(data, headers)

    await appendToSheet(project.spreadsheetId, sheetName, rowValues)

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Failed to create row' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { projectId, sheetName } = params

    if (!(await verifyAuth(request, projectId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId)
    })

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const endpoint = await db.query.endpoints.findFirst({
      where: and(
        eq(endpoints.projectId, projectId),
        eq(endpoints.sheetName, sheetName)
      )
    })

    if (!endpoint?.isPutEnabled) {
      return NextResponse.json({ error: 'PUT method not allowed' }, { status: 405 })
    }

    const body = await request.json()
    const data = body[sheetName] || body
    const rowId = data.id

    if (!rowId) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    const rows = await readSheet(project.spreadsheetId, sheetName)
    if (rows.length === 0) return NextResponse.json({ error: 'Sheet has no headers' }, { status: 400 })

    const headers = rows[0].map((h: any) => h?.toString().trim() || '')
    const rowValues = transformJSONToRow(data, headers)

    // Using rowIndex version of updateRow
    // We need to find the row index by ID
    const rowIndex = rows.findIndex((r: any) => r[0] === rowId); // Assuming id is in first column
    if (rowIndex === -1) return NextResponse.json({ error: 'Row not found' }, { status: 404 })

    await updateRow(project.spreadsheetId, sheetName, rowIndex + 1, rowValues)

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('PUT error:', error)
    return NextResponse.json({ error: 'Failed to update row' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { projectId, sheetName } = params
    const { searchParams } = new URL(request.url)
    const rowId = searchParams.get('id')

    if (!rowId) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

    if (!(await verifyAuth(request, projectId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId)
    })

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const endpoint = await db.query.endpoints.findFirst({
      where: and(
        eq(endpoints.projectId, projectId),
        eq(endpoints.sheetName, sheetName)
      )
    })

    if (!endpoint?.isDeleteEnabled) {
      return NextResponse.json({ error: 'DELETE method not allowed' }, { status: 405 })
    }

    const rows = await readSheet(project.spreadsheetId, sheetName)
    const rowIndex = rows.findIndex((r: any) => r[0] === rowId);
    if (rowIndex === -1) return NextResponse.json({ error: 'Row not found' }, { status: 404 })

    await deleteRow(project.spreadsheetId, sheetName, rowIndex + 1)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete row' }, { status: 500 })
  }
}

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
