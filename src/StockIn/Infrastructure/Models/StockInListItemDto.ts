import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import StockInEntity from '../../Domain/Entities/StockInEntity'

export class StockInListItemDto extends ResponseDto<StockInEntity> {
    @Expose()
    id!: string

    @Expose()
    updatedAt!: string

    @Expose()
    createdAt!: string

    @Expose()
    isDeleted!: boolean

    @Expose()
    isValidForApprovalRequest!: boolean

    @Expose()
    code!: string

    @Expose()
    supplierId!: string

    @Expose()
    supplierCode!: string

    @Expose()
    supplierName!: string

    @Expose()
    inDate!: string

    @Expose()
    description!: string

    @Expose()
    status!: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

    @Expose()
    notes!: string

    @Expose()
    priority!: number

    @Expose()
    totalAmount!: string

    @Expose()
    count!: number

    @Expose()
    lotNumber!: string

    toDomain(): StockInEntity {
        return {
            id: this.id,
            code: this.code,
            supplierId: this.supplierId,
            inDate: this.inDate,
            description: this.description,
            status: this.status,
            notes: this.notes,
            lotNumber: this.lotNumber,
            totalAmount: this.totalAmount,
            priority: this.priority,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            count: this.count,
            isDeleted: this.isDeleted,
            isValidForApprovalRequest: this.isValidForApprovalRequest,
            // Construct a lightweight supplier object from available data
            supplier: {
                id: this.supplierId,
                code: this.supplierCode,
                name: this.supplierName,
                isActive: true,
                isDeleted: false
            },
            // Initialize empty details array since this is a list item
            details: []
        }
    }
}

export interface StockInListResponseDto {
    data: StockInListItemDto[]
}