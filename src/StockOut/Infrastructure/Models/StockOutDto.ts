// src/StockOut/Infrastructure/Models/StockOutDto.ts
import { Expose, Type } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import StockOutEntity, { StockOutDetailEntity } from '../../Domain/Entities/StockOutEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export class StockOutDetailDto extends ResponseDto<StockOutDetailEntity> {
    @Expose()
    id!: string

    @Expose()
    updatedAt!: string

    @Expose()
    createdAt!: string

    @Expose()
    isDeleted!: boolean

    @Expose()
    goodsId!: string

    @Expose()
    code!: string

    @Expose()
    name!: string

    @Expose()
    quantity!: number

    @Expose()
    notes!: string

    toDomain(): StockOutDetailEntity {
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            isDeleted: this.isDeleted,
            goodsId: this.goodsId,
            code: this.code,
            name: this.name,
            quantity: this.quantity,
            notes: this.notes
        }
    }
}

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
    notes!: string

    @Expose()
    priority?: PriorityType | null

    @Expose()
    count?: number
    
    @Expose()
    updatedAt!: string

    @Expose()
    createdAt!: string

    @Expose()
    isDeleted!: boolean

    @Expose()
    isActive!: boolean

    @Expose()
    receiverName?: string

    @Expose()
    receiverPhone?: string

    @Expose()
    createdBy?: string

    @Expose()
    @Type(() => StockOutDetailDto)
    details?: StockOutDetailDto[]

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
            isActive: this.isActive,
            receiverName: this.receiverName,
            receiverPhone: this.receiverPhone,
            createdBy: this.createdBy,
            details: this.details?.map(detail => detail.toDomain())
        }
    }
}