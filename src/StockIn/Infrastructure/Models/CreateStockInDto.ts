import { Expose } from 'class-transformer'
import PayloadDto from 'src/Core/Infrastructure/Models/PayloadDto'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'

export default class CreateStockInDto extends PayloadDto<CreateStockInPayload> {
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
    status?: 'pending' | 'completed' | 'cancelled'

    transform(payload: CreateStockInPayload) {
        return {
            productId: payload.productId,
            productName: payload.productName,
            quantity: payload.quantity,
            unit: payload.unit,
            date: payload.date,
            receivedBy: payload.receivedBy,
            supplierName: payload.supplierName,
            supplierInvoice: payload.supplierInvoice,
            notes: payload.notes,
            status: payload.status || 'pending',
        }
    }
}
