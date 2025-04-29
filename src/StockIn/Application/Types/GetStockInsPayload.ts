// src/StockIn/Application/Types/GetStockInsPayload.ts
export default interface GetStockInsPayload {
    page: number;
    pageSize: number;
    status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    startDate?: string;
    endDate?: string;
    search?: string;
}