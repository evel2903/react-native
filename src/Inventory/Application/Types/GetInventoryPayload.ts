export default interface GetInventoryPayload {
    page: number
    pageSize: number
    category?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}
