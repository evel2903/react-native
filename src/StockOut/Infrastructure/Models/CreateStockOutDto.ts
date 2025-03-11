import { Expose } from 'class-transformer'
import PayloadDto from 'src/Core/Infrastructure/Models/PayloadDto'
import CreateStockOutPayload from '../../Application/Types/CreateStockOutPayload'

export default class CreateStockOutDto extends PayloadDto<CreateStockOutPayload> {
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
    status?: 'pending' | 'completed' | 'cancelled'

    transform(payload: CreateStockOutPayload) {
        return {
            productId: payload.productId,
            productName: payload.productName,
            quantity: payload.quantity,
            unit: payload.unit,
            date: payload.date,
            issuedBy: payload.issuedBy,
            issuedTo: payload.issuedTo,
            reason: payload.reason,
            notes: payload.notes,
            status: payload.status || 'pending',
        }
    }
}
