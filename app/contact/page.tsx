import { ContactContent } from './contact-content'
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with iDream Shop. We're here to help with your questions and feedback.",
  keywords: ["contact", "customer service", "support", "feedback", "help"]
}

export default function ContactPage() {
  return <ContactContent />
}

