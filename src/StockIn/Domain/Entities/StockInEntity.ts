export default interface StockInEntity {
    id: string
    productId: string
    productName: string
    quantity: number
    unit: string
    date: string
    receivedBy: string
    supplierName?: string
    supplierInvoice?: string
    notes?: string
    status: 'pending' | 'completed' | 'cancelled'
}
