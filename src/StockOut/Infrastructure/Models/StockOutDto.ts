import { Expose, Type } from 'class-transformer'
import ResponseDto from 'src/Core/Infrastructure/Models/ResponseDto'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'
import { StockOutProductItemDto } from './StockOutProductItemDto'

export default class StockOutDto extends ResponseDto<StockOutEntity> {
    @Expose()
    id!: string

    @Expose()
    reference!: string

    @Expose()
    date!: string

    @Expose()
    issuedBy!: string

    @Expose()
    issuedTo!: string

    @Expose()
    reason?: string

    @Expose()
    notes?: string

    @Expose()
    status!: 'pending' | 'processing' | 'completed' | 'cancelled'

    @Expose()
    @Type(() => StockOutProductItemDto)
    products!: StockOutProductItemDto[]

    @Expose()
    totalItems!: number

    toDomain(): StockOutEntity {
        return {
            id: this.id,
            reference: this.reference,
            date: this.date,
            issuedBy: this.issuedBy,
            issuedTo: this.issuedTo,
            reason: this.reason,
            notes: this.notes,
            status: this.status,
            products: this.products.map(product => ({
                productId: product.productId,
                productName: product.productName,
                quantity: product.quantity,
                unit: product.unit,
                price: product.price
            })),
            totalItems: this.totalItems
        }
    }
}