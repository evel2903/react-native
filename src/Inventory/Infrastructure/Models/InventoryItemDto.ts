import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import InventoryItemEntity from '../../Domain/Entities/InventoryItemEntity'

export default class InventoryItemDto extends ResponseDto<InventoryItemEntity> {
    @Expose()
    id!: string

    @Expose()
    productId!: string

    @Expose()
    name!: string

    @Expose()
    sku!: string

    @Expose()
    category!: string

    @Expose()
    quantity!: number

    @Expose()
    unit!: string

    @Expose()
    reorderLevel!: number

    @Expose()
    lastUpdated!: string

    toDomain(): InventoryItemEntity {
        return {
            id: this.id,
            productId: this.productId,
            name: this.name,
            sku: this.sku,
            category: this.category,
            quantity: this.quantity,
            unit: this.unit,
            reorderLevel: this.reorderLevel,
            lastUpdated: this.lastUpdated,
        }
    }
}
