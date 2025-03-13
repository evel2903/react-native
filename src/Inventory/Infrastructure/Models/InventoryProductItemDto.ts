import { Expose } from 'class-transformer'

export class InventoryProductItemDto {
    @Expose()
    productId!: string

    @Expose()
    productName!: string

    @Expose()
    expectedQuantity!: number

    @Expose()
    actualQuantity!: number

    @Expose()
    unit!: string

    @Expose()
    discrepancy!: number

    @Expose()
    lastUpdated!: string

    @Expose()
    notes?: string
}