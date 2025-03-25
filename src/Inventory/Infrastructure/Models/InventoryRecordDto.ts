import { Expose, Type } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import InventoryRecordEntity from '../../Domain/Entities/InventoryRecordEntity'
import { InventoryProductItemDto } from './InventoryProductItemDto'

export default class InventoryRecordDto extends ResponseDto<InventoryRecordEntity> {
    @Expose()
    id!: string

    @Expose()
    reference!: string

    @Expose()
    date!: string

    @Expose()
    conductedBy!: string

    @Expose()
    location?: string

    @Expose()
    status!: 'pending' | 'in-progress' | 'completed' | 'cancelled'

    @Expose()
    notes?: string

    @Expose()
    @Type(() => InventoryProductItemDto)
    products!: InventoryProductItemDto[]

    @Expose()
    totalItems!: number

    toDomain(): InventoryRecordEntity {
        return {
            id: this.id,
            reference: this.reference,
            date: this.date,
            conductedBy: this.conductedBy,
            location: this.location,
            status: this.status,
            notes: this.notes,
            products: this.products.map(product => ({
                productId: product.productId,
                productName: product.productName,
                expectedQuantity: product.expectedQuantity,
                actualQuantity: product.actualQuantity,
                unit: product.unit,
                discrepancy: product.discrepancy,
                lastUpdated: product.lastUpdated,
                notes: product.notes,
            })),
            totalItems: this.totalItems,
        }
    }
}
