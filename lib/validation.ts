export const validateShippingInfo = {
  firstName: (value: string) => {
    if (!value.trim()) return 'First name is required'
    if (value.length < 2) return 'First name must be at least 2 characters'
    if (!/^[a-zA-Z\s-']+$/.test(value)) return 'First name can only contain letters, spaces, hyphens and apostrophes'
    return null
  },

  lastName: (value: string) => {
    if (!value.trim()) return 'Last name is required'
    if (value.length < 2) return 'Last name must be at least 2 characters'
    if (!/^[a-zA-Z\s-']+$/.test(value)) return 'Last name can only contain letters, spaces, hyphens and apostrophes'
    return null
  },

  email: (value: string) => {
    if (!value.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address'
    return null
  },

  phone: (value: string) => {
    if (!value.trim()) return 'Phone number is required'
    if (!/^\+?[\d\s-()]{10,}$/.test(value)) return 'Please enter a valid phone number'
    return null
  },

  address: (value: string) => {
    if (!value.trim()) return 'Address is required'
    if (value.length < 5) return 'Please enter a complete address'
    return null
  },

  city: (value: string) => {
    if (!value.trim()) return 'City is required'
    if (!/^[a-zA-Z\s-']+$/.test(value)) return 'City can only contain letters, spaces, hyphens and apostrophes'
    return null
  },

  postalCode: (value: string) => {
    if (!value.trim()) return 'Postal code is required'
    // Canadian postal code format: A1A 1A1
    if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(value)) 
      return 'Please enter a valid Canadian postal code'
    return null
  },

  province: (value: string) => {
    const validProvinces = [
      'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
      'Newfoundland and Labrador', 'Nova Scotia', 'Ontario',
      'Prince Edward Island', 'Quebec', 'Saskatchewan'
    ]
    if (!validProvinces.includes(value)) return 'Please select a valid province'
    return null
  }
}

export const validateForm = (data: Record<string, string>) => {
  const errors: Record<string, string> = {}
  
  Object.keys(data).forEach(field => {
    if (field in validateShippingInfo) {
      const validator = validateShippingInfo[field as keyof typeof validateShippingInfo]
      const error = validator(data[field])
      if (error) errors[field] = error
    }
  })

  return errors
} 