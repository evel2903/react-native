import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import PickingOrderEntity from '../../Domain/Entities/PickingOrderEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export class PickingOrderListItemDto extends ResponseDto<PickingOrderEntity> {
    @Expose()
    id!: string

    @Expose()
    updatedAt!: string

    @Expose()
    createdAt!: string

    @Expose()
    isDeleted!: boolean

    @Expose()
    code!: string

    @Expose()
    pickingDate!: string

    @Expose()
    priority!: number

    @Expose()
    status!: string

    @Expose()
    requester?: string

    @Expose()
    requesterPhoneNumber?: string

    @Expose()
    note?: string

    @Expose()
    createdByUser?: string

    @Expose()
    assignedTo!: string

    @Expose()
    assignedUser!: string

    @Expose()
    isActive!: boolean

    // Progress tracking fields
    @Expose()
    totalItemsQty!: number

    @Expose()
    totalItemsPicked!: number

    // Other fields from API response
    @Expose()
    isValidForProcess!: boolean

    toDomain(): PickingOrderEntity {
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            isDeleted: this.isDeleted,
            code: this.code,
            pickingDate: this.pickingDate,
            priority: this.priority as PriorityType,
            status: this.status as PickingOrderEntity['status'],
            requester: this.requester || '',
            requesterPhoneNumber: this.requesterPhoneNumber || '',
            note: this.note || '',
            createdByUser: this.createdByUser || '',
            assignedTo: this.assignedTo,
            assignedUser: this.assignedUser,
            isActive: this.isActive,
            // Map progress tracking fields
            totalItemsQty: this.totalItemsQty || 0,
            totalItemsPicked: this.totalItemsPicked || 0,
            // Map other fields
            isValidForProcess: this.isValidForProcess,
            completedAt: null, // Provide a default value
            details: [], // Provide a default value
        }
    }
}

export interface PickingOrderListResponseDto {
    data: PickingOrderListItemDto[]
}
