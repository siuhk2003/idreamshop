'use client'

export async function trackPageView(path: string) {
  try {
    await fetch('/api/visits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path }),
    })
  } catch (error) {
    console.error('Failed to track page view:', error)
  }
} 