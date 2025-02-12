import { CheckoutContent } from './checkout-content'
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout process for your iDream Shop purchase",
  keywords: ["checkout", "payment", "secure shopping"]
}

export default function CheckoutPage() {
  return <CheckoutContent />
}

