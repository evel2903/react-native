export default interface GetStockInsPayload {
    page: number
    pageSize: number
    status?: 'pending' | 'processing' | 'completed' | 'cancelled'
    startDate?: string
    endDate?: string
    search?: string
}
