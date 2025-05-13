// src/StockOut/Application/Types/GetStockOutsPayload.ts
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export default interface GetStockOutsPayload {
    page: number
    pageSize: number

    // Filter parameters
    code?: string
    status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    priority?: PriorityType
    receiverId?: string
    startDate?: string
    endDate?: string
    search?: string
}