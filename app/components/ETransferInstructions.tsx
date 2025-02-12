'use client'

interface ETransferInstructionsProps {
  total: number
}

export function ETransferInstructions({ total }: ETransferInstructionsProps) {
  return (
    <div className="mt-4 p-4 border rounded-lg bg-blue-50">
      <h3 className="font-semibold mb-2">E-Transfer Instructions</h3>
      <p className="mb-2">Please send the total amount of CAD${total.toFixed(2)} to:</p>
      <p className="font-medium text-blue-600 mb-2">cs@idreamshop.ca</p>
      <p className="text-sm text-gray-600">Note: Your order will be processed after payment is received.</p>
    </div>
  )
} 