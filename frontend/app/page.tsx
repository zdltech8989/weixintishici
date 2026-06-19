'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FullPageLoading } from '@/components/layout/loading-spinner'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/use-template')
    } else {
      router.push('/login')
    }
  }, [router])

  return <FullPageLoading />
}