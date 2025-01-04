import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  // Check for admin authentication cookie
  const cookieStore = await cookies()
  const adminToken = await cookieStore.get('admin-token')

  // If no admin token is found, redirect to login
  if (!adminToken) {
    redirect('/admin/login')
  }

  // Redirect to orders page by default
  redirect('/admin/orders')
} 