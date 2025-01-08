import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

async function verifyRecaptcha(token: string) {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  })

  const data = await response.json()
  return data.success
}

export const POST = async (request: Request) => {
  try {
    const { name, email, message, captchaToken } = await request.json()

    // Verify reCAPTCHA
    const isValid = await verifyRecaptcha(captchaToken)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid reCAPTCHA' },
        { status: 400 }
      )
    }

    // Send email to admin
    await sendEmail({
      to: 'cs@idreamshop.ca',
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    })

    // Send confirmation email to user
    await sendEmail({
      to: email,
      subject: 'We received your message - iDream Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for contacting us!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you within 5 business days.</p>
          <p>For your reference, here is a copy of your message:</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
            ${message}
          </div>
          <p>Best regards,</p>
          <p>iDream Shop Customer Service Team</p>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 