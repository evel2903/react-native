import { Expose } from 'class-transformer'
import ResponseDto from 'src/Core/Infrastructure/Models/ResponseDto'
import StockInEntity from '../../Domain/Entities/StockInEntity'

export default class StockInDto extends ResponseDto<StockInEntity> {
    @Expose()
    id!: string

    @Expose()
    productId!: string

    @Expose()
    productName!: string

    @Expose()
    quantity!: number

    @Expose()
    unit!: string

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
    status!: 'pending' | 'completed' | 'cancelled'

    toDomain(): StockInEntity {
        return {
            id: this.id,
            productId: this.productId,
            productName: this.productName,
            quantity: this.quantity,
            unit: this.unit,
            date: this.date,
            receivedBy: this.receivedBy,
            supplierName: this.supplierName,
            supplierInvoice: this.supplierInvoice,
            notes: this.notes,
            status: this.status,
        }
    }
}
