import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

export function getCloudinaryUrl(path: string) {
  // Return empty string for null/undefined paths
  if (!path) return ''

  // If it's already a complete URL, return it
  if (path.startsWith('http')) return path

  // Ensure we have the version prefix
  const versionedPath = path.startsWith('v') ? path : `v1/${path}`

  // Return complete Cloudinary URL
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${versionedPath}`
}
