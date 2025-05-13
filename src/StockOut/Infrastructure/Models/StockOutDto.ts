// src/StockOut/Infrastructure/Models/StockOutDto.ts
import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export class StockOutDto extends ResponseDto<StockOutEntity> {
    @Expose()
    id!: string

    @Expose()
    code!: string

    @Expose()
    outDate!: string

    @Expose()
    description?: string

    @Expose()
    status!: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

    @Expose()
    notes?: string

    @Expose()
    priority?: PriorityType | null

    @Expose()
    count!: number
    
    @Expose()
    updatedAt!: string

    @Expose()
    createdAt!: string

    @Expose()
    isDeleted!: boolean

    @Expose()
    isActive!: boolean

    toDomain(): StockOutEntity {
        return {
            id: this.id,
            code: this.code,
            outDate: this.outDate,
            description: this.description,
            status: this.status,
            notes: this.notes,
            priority: this.priority,
            count: this.count,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            isDeleted: this.isDeleted,
            isActive: this.isActive
        }
    }
}