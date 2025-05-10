import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export default interface StorageVoucherEntity {
    id: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    code: string
    storageDate: string
    priority: PriorityType
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    notes: string
    createdBy: string
    assignedTo: string
    // New fields from updated API response
    isValidForProcess: boolean
    assignedName: string
}
