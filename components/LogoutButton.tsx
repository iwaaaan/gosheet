'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        await authClient.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
            Sign out
        </button>
    )
}
