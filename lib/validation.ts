export const validateShippingInfo = {
  firstName: (value: string) => {
    if (!value?.trim()) return 'First name is required'
    if (value.length < 2) return 'First name must be at least 2 characters'
    if (!/^[a-zA-Z\s-']+$/.test(value)) 
      return 'First name can only contain letters, spaces, hyphens and apostrophes'
    return null
  },

  lastName: (value: string) => {
    if (!value?.trim()) return 'Last name is required'
    if (value.length < 2) return 'Last name must be at least 2 characters'
    if (!/^[a-zA-Z\s-']+$/.test(value)) 
      return 'Last name can only contain letters, spaces, hyphens and apostrophes'
    return null
  },

  email: (value: string) => {
    if (!value?.trim()) return 'Email is required'
    // RFC 5322 email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    if (!emailRegex.test(value)) return 'Please enter a valid email address'
    return null
  },

  phone: (value: string) => {
    if (!value?.trim()) return 'Phone number is required'
    // North American phone format: +1 (123) 456-7890 or variations
    const phoneRegex = /^(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/
    if (!phoneRegex.test(value.replace(/\s+/g, ''))) 
      return 'Please enter a valid phone number (e.g., (123) 456-7890)'
    return null
  },

  address: (value: string) => {
    if (!value?.trim()) return 'Address is required'
    if (value.length < 5) return 'Please enter a complete address'
    if (!/^[a-zA-Z0-9\s,.-]+$/.test(value))
      return 'Address contains invalid characters'
    return null
  },

  city: (value: string) => {
    if (!value?.trim()) return 'City is required'
    if (!/^[a-zA-Z\s-']+$/.test(value))
      return 'City can only contain letters, spaces, hyphens and apostrophes'
    return null
  },

  postalCode: (value: string) => {
    if (!value?.trim()) return 'Postal code is required'
    // Canadian postal code format: A1A 1A1
    const postalRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i
    if (!postalRegex.test(value.trim()))
      return 'Please enter a valid Canadian postal code (e.g., A1A 1A1)'
    return null
  },

  province: (value: string) => {
    const validProvinces = [
      'Alberta',
      'British Columbia',
      'Manitoba',
      'New Brunswick',
      'Newfoundland and Labrador',
      'Nova Scotia',
      'Ontario',
      'Prince Edward Island',
      'Quebec',
      'Saskatchewan'
    ]
    if (!validProvinces.includes(value))
      return 'Please select a valid province'
    return null
  },

  password: (value: string) => {
    if (!value?.trim()) return 'Password is required'
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number'
    if (!/[!@#$%^&*]/.test(value)) return 'Password must contain at least one special character (!@#$%^&*)'
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