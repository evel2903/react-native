export default interface StockOutEntity {
    id: string
    productId: string
    productName: string
    quantity: number
    unit: string
    date: string
    issuedBy: string
    issuedTo: string
    reason?: string
    notes?: string
    status: 'pending' | 'completed' | 'cancelled'
}
