export default interface InventoryItemEntity {
    id: string
    productId: string
    name: string
    sku: string
    category: string
    quantity: number
    unit: string
    reorderLevel: number
    lastUpdated: string
}
