export default interface GetInventoryPayload {
    page: number
    pageSize: number
    status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
    startDate?: string
    endDate?: string
    location?: string
    search?: string
}