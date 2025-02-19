'use client'

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from '@/contexts/CartContext'
import { ThemeProvider } from "next-themes"
import { MemberProvider } from '@/app/contexts/MemberContext'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackPageView } from '@/lib/analytics'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "iDream Shop",
    template: "%s | iDream Shop"
  },
  description: "Trendy Earrings, Necklaces, and more at iDream Shop",
  keywords: ["earrings", "necklaces", "hair clips", "bracelets", "iDream Shop", "online store"],
  openGraph: {
    title: "iDream Shop",
    description: "Premium fashion accessories in Canada at iDream Shop",
    url: "https://idreamshop.ca",
    siteName: "iDream Shop",
    locale: "en_US",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    trackPageView(pathname)
  }, [pathname])

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <MemberProvider>
          <CartProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
              {children}
            </ThemeProvider>
          </CartProvider>
        </MemberProvider>
      </body>
    </html>
  );
}
