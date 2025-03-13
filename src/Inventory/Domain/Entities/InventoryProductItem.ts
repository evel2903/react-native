export interface InventoryProductItem {
    productId: string
    productName: string
    expectedQuantity: number
    actualQuantity: number
    unit: string
    discrepancy: number
    lastUpdated: string
    notes?: string
}