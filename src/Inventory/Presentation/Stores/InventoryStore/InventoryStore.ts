import { injectable, inject } from 'inversiland'
import { makeAutoObservable } from 'mobx'
import InventoryStoreState from '../../Types/InventoryStoreState'
import GetInventoryPayload from '@/src/Inventory/Application/Types/GetInventoryPayload'
import GetInventoryUseCase from '@/src/Inventory/Application/UseCases/GetInventoryUseCase'
import InventoryRecordEntity from '@/src/Inventory/Domain/Entities/InventoryRecordEntity'
import {
    IInventoryRepository,
    IInventoryRepositoryToken,
} from '@/src/Inventory/Domain/Specifications/IInventoryRepository'
import GetInventoryRecordUseCase from '@/src/Inventory/Application/UseCases/GetInventoryRecordUseCase'
import UpdateInventoryStatusUseCase from '@/src/Inventory/Application/UseCases/UpdateInventoryStatusUseCase'

@injectable()
export class InventoryStore implements InventoryStoreState {
    isLoading = false
    results: InventoryRecordEntity[] = []
    count = 0
    filters = {
        status: undefined as
            | undefined
            | 'pending'
            | 'in-progress'
            | 'completed'
            | 'cancelled',
        startDate: undefined,
        endDate: undefined,
        location: undefined,
        search: undefined,
    }
    pagination = {
        page: 1,
        pageSize: 10,
    }

    selectedInventoryRecord: InventoryRecordEntity | null = null
    error: string | null = null

    constructor(
        @inject(GetInventoryUseCase)
        private readonly getInventoryUseCase: GetInventoryUseCase,
        @inject(GetInventoryRecordUseCase)
        private readonly getInventoryRecordUseCase: GetInventoryRecordUseCase,
        @inject(UpdateInventoryStatusUseCase)
        private readonly updateInventoryStatusUseCase: UpdateInventoryStatusUseCase
    ) {
        makeAutoObservable(this)
    }

    get pageCount() {
        return Math.ceil(this.count / this.pagination.pageSize)
    }

    get isEmpty(): boolean {
        return this.results.length === 0
    }

    setIsLoading = (isLoading: boolean) => {
        this.isLoading = isLoading
    }

    setResults = (results: InventoryRecordEntity[]) => {
        this.results = results
    }

    setCount = (count: number) => {
        this.count = count
    }

    mergeFilters = (payload: Partial<InventoryStoreState['filters']>) => {
        Object.assign(this.filters, payload)
    }

    mergePagination = (
        payload: Partial<InventoryStoreState['pagination']>
    ): void => {
        Object.assign(this.pagination, payload)
    }

    setError = (error: string | null) => {
        this.error = error
    }

    setSelectedInventoryRecord = (record: InventoryRecordEntity | null) => {
        this.selectedInventoryRecord = record
    }

    // Get inventory records with current filters and pagination
    async getInventory() {
        const payload: GetInventoryPayload = {
            ...this.filters,
            ...this.pagination,
        }

        this.setIsLoading(true)
        this.setError(null)

        try {
            const response = await this.getInventoryUseCase.execute(payload)
            this.setResults(response.results)
            this.setCount(response.count)
        } catch (error) {
            console.error('Error fetching inventory records:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch inventory records'
            )
        } finally {
            this.setIsLoading(false)
        }
    }

    // Get inventory record details by ID
    async getInventoryRecordDetails(id: string) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const record = await this.getInventoryRecordUseCase.execute(id)
            this.setSelectedInventoryRecord(record)
            return record
        } catch (error) {
            console.error('Error fetching inventory record details:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch inventory record details'
            )
            return null
        } finally {
            this.setIsLoading(false)
        }
    }

    // Update inventory record status
    async updateStatus(id: string, status: InventoryRecordEntity['status']) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const updatedRecord = await this.updateInventoryStatusUseCase.execute({
                id,
                status,
            })

            // Update in the results list if present
            const index = this.results.findIndex(item => item.id === id)
            if (index !== -1) {
                this.results[index] = updatedRecord
            }

            // Update selected inventory record if it's the current one
            if (
                this.selectedInventoryRecord &&
                this.selectedInventoryRecord.id === id
            ) {
                this.setSelectedInventoryRecord(updatedRecord)
            }

            return updatedRecord
        } catch (error) {
            console.error('Error updating inventory record status:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update status'
            )
            return null
        } finally {
            this.setIsLoading(false)
        }
    }

    // Filter by status
    filterByStatus(status?: InventoryRecordEntity['status']) {
        this.filters.status = status
        this.pagination.page = 1
        this.getInventory()
    }

    // Filter by location
    filterByLocation(location?: string) {
        //this.filters.location = location
        this.pagination.page = 1
        this.getInventory()
    }

    // Filter by date range
    filterByDateRange(startDate?: string, endDate?: string) {
        //this.filters.startDate = startDate
        //this.filters.endDate = endDate
        this.pagination.page = 1
        this.getInventory()
    }

    // Search
    search(query?: string) {
        //this.filters.search = query
        this.pagination.page = 1
        this.getInventory()
    }

    // Reset filters
    resetFilters() {
        this.filters = {
            status: undefined,
            startDate: undefined,
            endDate: undefined,
            location: undefined,
            search: undefined,
        }
        this.pagination.page = 1
        this.getInventory()
    }

    // Go to page
    goToPage(page: number) {
        if (page >= 1 && page <= this.pageCount) {
            this.pagination.page = page
            this.getInventory()
        }
    }
}