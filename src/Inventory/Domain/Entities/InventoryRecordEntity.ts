import { InventoryProductItem } from "./InventoryProductItem";
export default interface InventoryRecordEntity {
    id: string
    reference: string
    date: string
    conductedBy: string
    location?: string
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
    notes?: string
    products: InventoryProductItem[]
    totalItems: number
}