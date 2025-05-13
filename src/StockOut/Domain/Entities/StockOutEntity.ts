// src/StockOut/Domain/Entities/StockOutEntity.ts
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export interface StockOutDetailEntity {
    id: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    goodsId: string
    code: string
    name: string
    quantity: number
    notes: string
}

export default interface StockOutEntity {
    id: string
    code: string
    outDate: string
    description?: string
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    notes?: string
    priority?: PriorityType | null
    count?: number
    
    // Fields from API response
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    isActive: boolean
    
    // Receiver information
    receiverName?: string
    receiverPhone?: string
    
    // Additional information
    createdBy?: string
    
    // Stock out details
    details?: StockOutDetailEntity[]
}