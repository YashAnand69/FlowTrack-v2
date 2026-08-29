export interface ValidationError {
  field: string
  message: string
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function validateClientForm(data: {
  name: string
  email: string
  company?: string
  phone?: string
  address?: string
}): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.name || !data.name.trim()) {
    errors.name = 'Client name is required.'
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please provide a valid email address (e.g. name@company.com).'
  }

  return errors
}

export interface InvoiceItemInput {
  description: string
  quantity: number
  rate: number
}

export interface InvoiceFormInput {
  client_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  notes?: string
  items: InvoiceItemInput[]
}

export function validateInvoiceForm(data: InvoiceFormInput): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!data.client_id) {
    errors.client_id = 'Please select a client.'
  }

  if (!data.invoice_number || !data.invoice_number.trim()) {
    errors.invoice_number = 'Invoice number is required.'
  }

  if (!data.issue_date) {
    errors.issue_date = 'Issue date is required.'
  }

  if (!data.due_date) {
    errors.due_date = 'Due date is required.'
  } else if (data.issue_date && new Date(data.due_date) < new Date(data.issue_date)) {
    errors.due_date = 'Due date cannot be before the issue date.'
  }

  if (!data.items || data.items.length === 0) {
    errors.items = 'At least one line item is required.'
  } else {
    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i]
      if (!item.description || !item.description.trim()) {
        errors[`item_${i}_desc`] = `Item #${i + 1} description cannot be empty.`
      }
      if (item.quantity <= 0) {
        errors[`item_${i}_qty`] = `Item #${i + 1} quantity must be greater than 0.`
      }
      if (item.rate < 0) {
        errors[`item_${i}_rate`] = `Item #${i + 1} rate cannot be negative.`
      }
    }
  }

  return errors
}
