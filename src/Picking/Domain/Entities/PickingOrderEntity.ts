import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export interface PickingOrderItemEntity {
    id: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    pickingOrderDetailId: string
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

export interface PickingOrderDetailEntity {
    id: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    pickingOrderId: string
    stockId: string
    code: string
    name: string
    supplier: string
    lotNumber: string
    expiryDate: string
    price: string
    quantity: number
    notes: string
    status: string
    pickingOrderItems: PickingOrderItemEntity[]
}

export default interface PickingOrderEntity {
    id: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    code: string
    pickingDate: string
    priority: PriorityType
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    requester: string
    requesterPhoneNumber: string
    note: string
    createdByUser: string
    assignedTo: string
    assignedUser: string
    isActive: boolean
    // Progress tracking fields
    totalItemsQty: number
    totalItemsPicked: number
    // Other fields from API response
    isValidForProcess: boolean
    completedAt: string | null
    details: PickingOrderDetailEntity[]
}