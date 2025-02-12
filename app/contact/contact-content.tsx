'use client'

import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export function ContactContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const captchaToken = recaptchaRef.current?.getValue()
    
    if (!captchaToken) {
      setStatus('error')
      setErrorMessage('Please complete the reCAPTCHA')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          captchaToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', message: '' })
        recaptchaRef.current?.reset()
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send message')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
          
          {status === 'success' ? (
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-green-800">
                Thank you for your message! We will get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="h-32"
                />
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                />
              </div>

              {status === 'error' && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800">{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
} 