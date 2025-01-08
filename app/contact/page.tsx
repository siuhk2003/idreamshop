'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Instagram, Facebook } from 'lucide-react'
import ReCAPTCHA from "react-google-recaptcha"

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!captchaToken) {
      setError('Please complete the reCAPTCHA')
      return
    }

    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      captchaToken
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        setSuccess(true)
        formRef.current?.reset()
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send message')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Contact Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {success && (
                <div className="bg-green-50 text-green-600 p-4 rounded mb-4">
                  Message sent successfully! We'll get back to you within 5 business days.
                </div>
              )}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
                  {error}
                </div>
              )}
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <Input type="text" id="name" name="name" required className="mt-1" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <Input type="email" id="email" name="email" required className="mt-1" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                  <Textarea id="message" name="message" rows={4} required className="mt-1" />
                </div>
                <div className="mb-4">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                    onChange={(token) => setCaptchaToken(token)}
                  />
                </div>
                <Button type="submit" disabled={loading || !captchaToken}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
              <p className="text-gray-600 mb-4">Follow us on social media for the latest updates, promotions, and styling tips!</p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  <Instagram className="w-6 h-6" />
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  <Facebook className="w-6 h-6" />
                  <span className="sr-only">Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

