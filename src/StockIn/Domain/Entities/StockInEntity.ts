import { StockInDetailItem } from './StockInDetailItem'
import { SupplierEntity } from './SupplierEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export default interface StockInEntity {
    id: string
    code: string
    supplierId: string
    inDate: string
    description?: string
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    notes?: string
    lotNumber?: string
    totalAmount: string

    // Fields from updated API response
    priority?: PriorityType
    createdAt?: string
    updatedAt?: string
    count?: number
    isDeleted?: boolean
    isValidForApprovalRequest?: boolean

    // Existing fields that may not be in the base response
    createdBy?: string | null
    approvedBy?: string | null
    details: StockInDetailItem[]
    supplier?: SupplierEntity
}
