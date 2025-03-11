import { Expose } from 'class-transformer'
import ResponseDto from 'src/Core/Infrastructure/Models/ResponseDto'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'

export default class StockOutDto extends ResponseDto<StockOutEntity> {
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
    issuedBy!: string

    @Expose()
    issuedTo!: string

    @Expose()
    reason?: string

    @Expose()
    notes?: string

    @Expose()
    status!: 'pending' | 'completed' | 'cancelled'

    toDomain(): StockOutEntity {
        return {
            id: this.id,
            productId: this.productId,
            productName: this.productName,
            quantity: this.quantity,
            unit: this.unit,
            date: this.date,
            issuedBy: this.issuedBy,
            issuedTo: this.issuedTo,
            reason: this.reason,
            notes: this.notes,
            status: this.status,
        }
    }
}
