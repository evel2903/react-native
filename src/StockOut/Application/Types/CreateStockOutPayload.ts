import { StockOutProductItem } from '../../Domain/Entities/StockOutProductItem'

export default interface CreateStockOutPayload {
    products: StockOutProductItem[]
    date: string
    issuedBy: string
    issuedTo: string
    reason?: string
    notes?: string
    status?: 'pending' | 'processing' | 'completed' | 'cancelled'
}