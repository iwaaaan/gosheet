'use server'

import { db } from '@/db'
import { projects, endpoints, projectAuth } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getProjectDetail(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return null

    return await db.query.projects.findFirst({
        where: and(
            eq(projects.id, projectId),
            eq(projects.userId, session.user.id)
        )
    })
}

export async function getEndpoints(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return []

    return await db.query.endpoints.findMany({
        where: eq(endpoints.projectId, projectId),
        orderBy: (endpoints, { asc }) => [asc(endpoints.sheetName)]
    })
}

export async function toggleEndpointMethod(endpointId: string, method: string, value: boolean) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return { error: 'Unauthorized' }

    const columnMap: Record<string, any> = {
        is_get_enabled: endpoints.isGetEnabled,
        is_post_enabled: endpoints.isPostEnabled,
        is_put_enabled: endpoints.isPutEnabled,
        is_delete_enabled: endpoints.isDeleteEnabled,
    }

    const column = columnMap[method]
    if (!column) return { error: 'Invalid method' }

    await db.update(endpoints)
        .set({ [column.name]: value })
        .where(eq(endpoints.id, endpointId))

    revalidatePath(`/dashboard`)
    return { success: true }
}

export async function getProjectAuthConfig(projectId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return null

    return await db.query.projectAuth.findFirst({
        where: eq(projectAuth.projectId, projectId)
    })
}

export async function updateProjectAuthConfig(projectId: string, authType: string, authConfig: any) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return { error: 'Unauthorized' }

    await db.insert(projectAuth)
        .values({
            projectId,
            authType,
            authConfig,
        })
        .onDuplicateKeyUpdate({
            set: {
                authType,
                authConfig,
            }
        })

    revalidatePath(`/dashboard/${projectId}`)
    return { success: true }
}

export async function updateProjectName(projectId: string, name: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) return { error: 'Unauthorized' }

    await db.update(projects)
        .set({ name })
        .where(
            and(
                eq(projects.id, projectId),
                eq(projects.userId, session.user.id)
            )
        )

    revalidatePath(`/dashboard/${projectId}`)
    return { success: true }
}
