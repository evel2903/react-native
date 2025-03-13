import { StockOutProductItem } from './StockOutProductItem'

export default interface StockOutEntity {
    id: string
    reference: string
    date: string
    issuedBy: string
    issuedTo: string
    reason?: string
    notes?: string
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    products: StockOutProductItem[]
    totalItems: number
}