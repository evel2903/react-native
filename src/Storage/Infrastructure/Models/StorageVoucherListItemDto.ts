import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import StorageVoucherEntity from '../../Domain/Entities/StorageVoucherEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export class StorageVoucherListItemDto extends ResponseDto<StorageVoucherEntity> {
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
    storageDate!: string

    @Expose()
    priority!: number

    @Expose()
    status!: string

    @Expose()
    notes?: string

    @Expose()
    createdBy?: string

    @Expose()
    assignedTo!: string

    // New fields from updated API response
    @Expose()
    isValidForProcess!: boolean

    @Expose()
    assignedName!: string

    toDomain(): StorageVoucherEntity {
        return {
            id: this.id,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt,
            isDeleted: this.isDeleted,
            code: this.code,
            storageDate: this.storageDate,
            priority: this.priority as PriorityType,
            status: this.status as StorageVoucherEntity['status'],
            notes: this.notes || '',
            createdBy: this.createdBy || '',
            assignedTo: this.assignedTo,
            // New fields mapping
            isValidForProcess: this.isValidForProcess,
            assignedName: this.assignedName,
            completedAt: null, // Provide a default value or map it if available
            details: [], // Provide a default value or map it if available
        }
    }
}

export interface StorageVoucherListResponseDto {
    data: StorageVoucherListItemDto[]
}
