import { StockInProductItem } from './StockInGoodItem'
export default interface StockInEntity {
    id: string
    reference: string
    date: string
    receivedBy: string
    supplierName?: string
    supplierInvoice?: string
    notes?: string
    status: 'pending' | 'processing' | 'completed' | 'cancelled'
    products: StockInProductItem[]
    totalItems: number
}
