import { Expose, Type } from 'class-transformer'
import ResponseDto from 'src/Core/Infrastructure/Models/ResponseDto'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import { StockInDetailItemDto } from './StockInDetailItemDto'
import { SupplierDto } from './SupplierDto'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export default class StockInDto extends ResponseDto<StockInEntity> {
    @Expose()
    id!: string

    @Expose()
    code!: string

    @Expose()
    supplierId!: string

    @Expose()
    inDate!: string

    @Expose()
    description?: string

    @Expose()
    status!: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

    @Expose()
    notes?: string

    @Expose()
    lotNumber?: string

    @Expose()
    totalAmount!: string

    @Expose()
    createdBy?: string | null

    @Expose()
    approvedBy?: string | null

    @Expose()
    @Type(() => StockInDetailItemDto)
    details!: StockInDetailItemDto[]

    @Expose()
    @Type(() => SupplierDto)
    supplier?: SupplierDto

    // New fields from API response
    @Expose()
    priority?: PriorityType

    @Expose()
    createdAt?: string

    @Expose()
    updatedAt?: string

    @Expose()
    count?: number

    @Expose()
    isDeleted?: boolean

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
            createdBy: this.createdBy,
            approvedBy: this.approvedBy,
            priority: this.priority,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            count: this.count,
            isDeleted: this.isDeleted,
            details: this.details.map(detail => ({
                id: detail.id,
                goodsId: detail.goodsId,
                goodsCode: detail.goodsCode, // Map the goodsCode property
                goodsName: detail.goodsName, // Map the goodsName property
                quantity: detail.quantity,
                price: detail.price,
                expiryDate: detail.expiryDate,
                notes: detail.notes,
                goods: detail.goods,
            })),
            supplier: this.supplier
                ? {
                      id: this.supplier.id,
                      code: this.supplier.code,
                      name: this.supplier.name,
                      isActive: this.supplier.isActive,
                      isDeleted: this.supplier.isDeleted,
                  }
                : undefined,
        }
    }
}