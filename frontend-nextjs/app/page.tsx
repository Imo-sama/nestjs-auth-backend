'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function Home() {
  const router = useRouter()
  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [token, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Loading...</div>
    </div>
  )
}
