import { Expose, Type } from 'class-transformer'
import ResponseDto from 'src/Core/Infrastructure/Models/ResponseDto'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import { StockInProductItemDto } from './StockInProductItemDto'
export default class StockInDto extends ResponseDto<StockInEntity> {
    @Expose()
    id!: string

    @Expose()
    reference!: string

    @Expose()
    date!: string

    @Expose()
    receivedBy!: string

    @Expose()
    supplierName?: string

    @Expose()
    supplierInvoice?: string

    @Expose()
    notes?: string

    @Expose()
    status!: 'pending' | 'processing' | 'completed' | 'cancelled'

    @Expose()
    @Type(() => StockInProductItemDto)
    products!: StockInProductItemDto[]

    @Expose()
    totalItems!: number

    toDomain(): StockInEntity {
        return {
            id: this.id,
            reference: this.reference,
            date: this.date,
            receivedBy: this.receivedBy,
            supplierName: this.supplierName,
            supplierInvoice: this.supplierInvoice,
            notes: this.notes,
            status: this.status,
            products: this.products.map(product => ({
                productId: product.productId,
                productName: product.productName,
                quantity: product.quantity,
                unit: product.unit,
                price: product.price,
            })),
            totalItems: this.totalItems,
        }
    }
}
