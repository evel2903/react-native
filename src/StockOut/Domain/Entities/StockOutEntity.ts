// src/StockOut/Domain/Entities/StockOutEntity.ts
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export default interface StockOutEntity {
    id: string
    code: string
    outDate: string
    description?: string
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    notes?: string
    priority?: PriorityType | null
    count: number
    
    // Fields from API response
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    isActive: boolean
}