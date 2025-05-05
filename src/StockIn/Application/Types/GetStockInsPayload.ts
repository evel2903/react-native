// src/StockIn/Application/Types/GetStockInsPayload.ts
import { PriorityType } from '@/src/Common/Domain/Enums/Priority';

export default interface GetStockInsPayload {
    page: number;
    pageSize: number;
    
    // Filter parameters
    code?: string;
    status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    priority?: PriorityType;
    supplierId?: string;
    lotNumber?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}