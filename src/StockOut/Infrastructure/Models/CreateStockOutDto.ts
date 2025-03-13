import { Expose, Type } from 'class-transformer'
import PayloadDto from 'src/Core/Infrastructure/Models/PayloadDto'
import CreateStockOutPayload from '../../Application/Types/CreateStockOutPayload'
import { StockOutProductItemDto } from './StockOutProductItemDto'

export default class CreateStockOutDto extends PayloadDto<CreateStockOutPayload> {
    @Expose()
    @Type(() => StockOutProductItemDto)
    products!: StockOutProductItemDto[]

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
    status?: 'pending' | 'processing' | 'completed' | 'cancelled'

    transform(payload: CreateStockOutPayload) {
        return {
            products: payload.products,
            date: payload.date,
            issuedBy: payload.issuedBy,
            issuedTo: payload.issuedTo,
            reason: payload.reason,
            notes: payload.notes,
            status: payload.status || 'pending'
        }
    }
}