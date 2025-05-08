// src/Core/Utils/DateUtils.ts

/**
 * Format date to YYYY/MM/DD format
 * @param date Date object or date string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | undefined): string => {
    if (!date) return ''
    try {
        const dateObject = typeof date === 'string' ? new Date(date) : date
        return dateObject.toLocaleDateString('en-CA').replace(/-/g, '/')
    } catch (e) {
        console.error('Error formatting date:', e)
        return ''
    }
}

/**
 * Format date and time to local string representation
 * @param date Date object or date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string | undefined): string => {
    if (!date) return 'N/A'
    try {
        const dateObject = typeof date === 'string' ? new Date(date) : date
        return dateObject.toLocaleString()
    } catch (e) {
        console.error('Error formatting date time:', e)
        return 'N/A'
    }
}

/**
 * Format currency amount with specified locale and currency
 * @param amount Number or string representing an amount
 * @param locale The locale to use for formatting (default: 'en-US')
 * @param currency The currency code to use (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (
    amount: number | string,
    locale: string = 'en-US',
    currency: string = 'USD'
): string => {
    try {
        const numericAmount =
            typeof amount === 'string' ? parseFloat(amount) : amount
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(numericAmount)
    } catch (e) {
        console.error('Error formatting currency:', e)
        return ''
    }
}
