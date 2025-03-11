export default interface GetStockOutsPayload {
    page: number
    pageSize: number
    status?: 'pending' | 'completed' | 'cancelled'
    startDate?: string
    endDate?: string
    search?: string
}
