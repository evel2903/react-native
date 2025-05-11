import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export interface StorageVoucherItemEntity {
    id: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    storageVoucherDetailId: string
    stockId: string
    shelfId: string
    rowId: string
    areaId: string
    warehouseId: string
    shelfName: string
    rowName: string
    areaName: string
    warehouseName: string
    quantity: number
    level: number
    position: number
    status: string
}

export interface StorageVoucherDetailEntity {
    id: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    storageVoucherId: string
    stockId: string
    code: string
    name: string
    supplier: string
    lotNumber: string
    expiryDate: string
    cost: string
    quantity: number
    notes: string
    status: string
    storageVoucherItems: StorageVoucherItemEntity[]
}

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
    completedAt: string | null
    details: StorageVoucherDetailEntity[]
}