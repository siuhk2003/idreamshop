import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  // Check for admin authentication cookie
  const cookieStore = cookies()
  const adminToken = cookieStore.get('admin-token')

  // If no admin token is found, redirect to login
  if (!adminToken) {
    redirect('/admin/login')
  }

  // If authenticated, redirect to orders page
  redirect('/admin/orders')
} 