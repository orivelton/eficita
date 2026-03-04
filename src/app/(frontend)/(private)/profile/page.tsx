'use client'

import { useRouter } from 'next/navigation'
import { UserProfile } from '@/components/user-profile'
import { getLoggedUser } from '@/lib/auth'

export default function ProfilePage() {
  const router = useRouter()
  const user = getLoggedUser()

  const handleUpdate = (updated: any) => {
    // nothing special, the wrapper holds session data
  }

  if (!user) {
    router.replace('/')
    return null
  }

  return <UserProfile user={user} onUserUpdate={handleUpdate} />
}
