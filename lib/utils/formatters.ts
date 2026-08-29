export const CURRENCY_SYMBOLS: Record<string, { symbol: string; label: string; locale: string }> = {
  USD: { symbol: '$', label: 'USD ($)', locale: 'en-US' },
  EUR: { symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  GBP: { symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
  CAD: { symbol: 'CA$', label: 'CAD ($)', locale: 'en-CA' },
  AUD: { symbol: 'AU$', label: 'AUD ($)', locale: 'en-AU' },
  INR: { symbol: '₹', label: 'INR (₹)', locale: 'en-IN' },
  JPY: { symbol: '¥', label: 'JPY (¥)', locale: 'ja-JP' },
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const meta = CURRENCY_SYMBOLS[currencyCode] || CURRENCY_SYMBOLS.USD
  const isZeroDecimal = currencyCode === 'JPY'

  try {
    return new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(amount)
  } catch {
    return `${meta.symbol}${amount.toFixed(isZeroDecimal ? 0 : 2)}`
  }
}

export function formatDate(dateStr: string | Date): string {
  if (!dateStr) return ''
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  if (isNaN(date.getTime())) return String(dateStr)

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function getDaysRemaining(dueDateStr: string): { text: string; isOverdue: boolean; days: number } {
  if (!dueDateStr) return { text: '', isOverdue: false, days: 0 }
  const due = new Date(dueDateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      text: `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`,
      isOverdue: true,
      days: diffDays,
    }
  } else if (diffDays === 0) {
    return { text: 'Due today', isOverdue: false, days: 0 }
  } else {
    return {
      text: `Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`,
      isOverdue: false,
      days: diffDays,
    }
  }
}

export function generateInvoiceNumber(existingCount: number = 0): string {
  const year = new Date().getFullYear()
  const sequence = String(existingCount + 1).padStart(3, '0')
  return `INV-${year}-${sequence}`
}
