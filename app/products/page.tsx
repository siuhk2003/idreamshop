import { ProductsContent } from './products-content'
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Products",
  description: "Browse our collection of premium fashion accessories. Find earrings, necklaces, bracelets, and more.",
  keywords: ["fashion accessories", "earrings", "necklaces", "bracelets", "online shopping"]
}

export default function ProductsPage() {
  return <ProductsContent />
}


