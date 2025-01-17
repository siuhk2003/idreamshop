import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto prose prose-slate prose-headings:text-gray-800 prose-ul:list-disc prose-ol:list-decimal">
        <h1 className="text-center text-2xl font-bold text-green-500">Refund and Return Policy</h1>
        <p>At <strong>iDream</strong>, we are committed to providing excellent customer service and ensuring your satisfaction with our products. Please review our refund and return policy carefully.</p>
        <br></br>
        <h2>1. Eligibility for Returns</h2>
        <p>Due to the nature of our products, we prioritize hygiene and safety for our customers. Therefore:</p>
        <ul>
            <li><strong>Non-Returnable Items:</strong> Earrings and hair accessories (e.g., hair clips) cannot be returned if they have been opened or used due to health and hygiene concerns.</li>
            <li><strong>Returnable Items:</strong> Products that are defective, damaged during shipping, or not as described are eligible for returns.</li>
            <li><strong>Return Conditions:</strong> Items must be in their original, unused condition, with all packaging intact. Returns must be initiated within <strong>14 days</strong> of delivery.</li>
        </ul>
        <br></br>
        <h2>2. Refund Policy</h2>
        <ul>
            <li><strong>Refund Eligibility:</strong> Full refunds are issued for defective, damaged, or incorrect items. Refunds are processed after the returned product is inspected and approved.</li>
            <li><strong>Refund Process:</strong> Approved refunds will be issued to the original payment method within <strong>5–7 business days</strong>.</li>
            <li><strong>Non-Refundable Conditions:</strong> Opened or used items (unless defective) and change-of-mind returns for earrings and hair clips.</li>
        </ul>
        <br></br>
        <h2>3. Return Process</h2>
        <p>To initiate a return:</p>
        <ol>
            <li>Email us at <strong>cs@idreamshop.ca</strong> with:
                <ul>
                    <li>Your order number.</li>
                    <li>A detailed description of the issue.</li>
                    <li>Photos of the damaged or defective item (if applicable).</li>
                </ul>
            </li>
            <li><strong>Shipping for Returns:</strong>
                <ul>
                    <li>For defective or incorrect items: We will cover the return shipping cost and provide a prepaid shipping label.</li>
                    <li>For all other eligible returns: Customers are responsible for the return shipping cost.</li>
                </ul>
            </li>
        </ol>
        <br></br>

        <h2>4. Exchanges</h2>
        <p>We do not offer direct exchanges due to inventory limitations. If you wish to exchange an item, please return the original item (if eligible) for a refund and place a new order.</p>
        <br></br>
        <h2>5. Damaged or Defective Items</h2>
        <ul>
            <li>If an item arrives damaged, contact us within <strong>48 hours</strong> of delivery with photos of the damaged item and packaging.</li>
            <li>Defective items reported after 48 hours may be subject to further evaluation.</li>
        </ul>
        <br></br>
        <h2>6. Exceptions to the Policy</h2>
        <ul>
            <li><strong>Sale or Clearance Items:</strong> All sales are final on discounted or clearance items unless they are defective.</li>
            <li><strong>Late Returns:</strong> Returns initiated after the 14-day window will not be accepted.</li>
        </ul>
        <br></br>
        <h2>7. Compliance with BC Laws</h2>
        <p>This policy complies with <strong>Consumer Protection BC</strong>, ensuring fair practices for businesses and consumers. We are committed to resolving issues promptly and transparently.</p>
        <br></br>
        <h2>8. Contact Us</h2>
        <p>If you have any questions or concerns regarding our refund and return policy, please contact us:</p>
            <ul>
                <li><strong>Email:</strong> cs@idreamshop.ca</li>
            </ul>
        <br></br>
         <p className="text-center font-italic mt-4">
        We value your satisfaction and aim to provide a seamless shopping experience. Please carefully review this policy before makeing a purchase.  By placing an order with iDream, you agree to the terms outlined in this policy.</p>
        <p className="text-center font-italic mt-4">Thank you for choosing iDream!</p>
        </div>
      </main>
      <Footer />
    </div>
  )
} 