'use server'

import { db } from '@/db'
import { projects, endpoints, projectAuth } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getSheetNames } from '@/lib/google-sheets'
import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'

export async function getProjects() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return []
  }

  const projectsData = await db.query.projects.findMany({
    where: eq(projects.userId, session.user.id),
    with: {
      endpoints: true
    },
    orderBy: (projects, { desc }) => [desc(projects.createdAt)]
  })

  return projectsData.map(p => ({
    id: p.id,
    name: p.name,
    created_at: p.createdAt?.toISOString() || '',
    endpoint_count: p.endpoints.length
  }))
}

export async function createProject(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const spreadsheetUrl = formData.get('spreadsheetUrl') as string

  const spreadsheetIdMatch = spreadsheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (!spreadsheetIdMatch) {
    return { error: 'Invalid Google Sheets URL' }
  }

  const spreadsheetId = spreadsheetIdMatch[1]

  try {
    const sheetNames = await getSheetNames(spreadsheetId)

    const projectId = crypto.randomUUID()

    await db.insert(projects).values({
      id: projectId,
      userId: session.user.id,
      name,
      spreadsheetId,
    })

    const endpointValues = sheetNames.map(sheetName => ({
      id: crypto.randomUUID(),
      projectId: projectId,
      sheetName: sheetName,
      isGetEnabled: true,
      isPostEnabled: false,
      isPutEnabled: false,
      isDeleteEnabled: false,
    }))

    if (endpointValues.length > 0) {
      await db.insert(endpoints).values(endpointValues)
    }

    await db.insert(projectAuth).values({
      projectId: projectId,
      authType: 'none',
    })

    revalidatePath('/dashboard')
    return { success: true, projectId: projectId }
  } catch (error: any) {
    return { error: error.message || 'Failed to create project' }
  }
}

export async function deleteProject(projectId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return { error: 'Unauthorized' }
  }

  try {
    // MySQL cascading delete should handle endpoints and projectAuth if defined in DB,
    // but Drizzle references keep it metadata-only unless push/migration is done with constraints.
    // I set references with onDelete: 'cascade' in schema.ts
    await db.delete(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.userId, session.user.id)
        )
      )

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
