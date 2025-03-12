import { injectable, inject } from 'inversiland'
import { makeAutoObservable } from 'mobx'
import StockInStoreState from '../../Types/StockInStoreState'
import GetStockInsPayload from '@/src/StockIn/Application/Types/GetStockInsPayload'
import GetStockInsUseCase from '@/src/StockIn/Application/UseCases/GetStockInsUseCase'
import StockInEntity from '@/src/StockIn/Domain/Entities/StockInEntity'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '@/src/StockIn/Domain/Specifications/IStockInRepository'

@injectable()
export class StockInStore implements StockInStoreState {
    isLoading = false
    results: StockInEntity[] = []
    count = 0
    filters = {
        status: undefined as
            | undefined
            | 'pending'
            | 'processing'
            | 'completed'
            | 'cancelled',
        startDate: undefined,
        endDate: undefined,
        search: undefined,
    }
    pagination = {
        page: 1,
        pageSize: 10,
    }

    selectedStockIn: StockInEntity | null = null
    error: string | null = null

    constructor(
        @inject(GetStockInsUseCase)
        private readonly getStockInsUseCase: GetStockInsUseCase,
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
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

    setResults = (results: StockInEntity[]) => {
        this.results = results
    }

    setCount = (count: number) => {
        this.count = count
    }

    mergeFilters = (payload: Partial<StockInStoreState['filters']>) => {
        Object.assign(this.filters, payload)
    }

    mergePagination = (
        payload: Partial<StockInStoreState['pagination']>
    ): void => {
        Object.assign(this.pagination, payload)
    }

    setError = (error: string | null) => {
        this.error = error
    }

    setSelectedStockIn = (stockIn: StockInEntity | null) => {
        this.selectedStockIn = stockIn
    }

    // Get stock ins with current filters and pagination
    async getStockIns() {
        const payload: GetStockInsPayload = {
            ...this.filters,
            ...this.pagination,
        }

        this.setIsLoading(true)
        this.setError(null)

        try {
            const response = await this.getStockInsUseCase.execute(payload)
            this.setResults(response.results)
            this.setCount(response.count)
        } catch (error) {
            console.error('Error fetching stock ins:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch stock ins'
            )
        } finally {
            this.setIsLoading(false)
        }
    }

    // Get stock in details by ID
    async getStockInDetails(id: string) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const stockIn = await this.stockInRepository.getStockInById(id)
            this.setSelectedStockIn(stockIn)
            return stockIn
        } catch (error) {
            console.error('Error fetching stock in details:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch stock in details'
            )
            return null
        } finally {
            this.setIsLoading(false)
        }
    }

    // Update stock in status
    async updateStatus(id: string, status: StockInEntity['status']) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const updatedStockIn =
                await this.stockInRepository.updateStockInStatus(id, status)

            // Update in the results list if present
            const index = this.results.findIndex(item => item.id === id)
            if (index !== -1) {
                this.results[index] = updatedStockIn
            }

            // Update selected stock in if it's the current one
            if (this.selectedStockIn && this.selectedStockIn.id === id) {
                this.setSelectedStockIn(updatedStockIn)
            }

            return updatedStockIn
        } catch (error) {
            console.error('Error updating stock in status:', error)
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
    filterByStatus(status?: StockInEntity['status']) {
        this.filters.status = status
        this.pagination.page = 1
        this.getStockIns()
    }

    // Filter by date range
    filterByDateRange(startDate?: string, endDate?: string) {
        //this.filters.startDate = startDate;
        //this.filters.endDate = endDate;
        this.pagination.page = 1
        this.getStockIns()
    }

    // Search
    search(query?: string) {
        //this.filters.search = query;
        this.pagination.page = 1
        this.getStockIns()
    }

    // Reset filters
    resetFilters() {
        this.filters = {
            status: undefined,
            startDate: undefined,
            endDate: undefined,
            search: undefined,
        }
        this.pagination.page = 1
        this.getStockIns()
    }

    // Go to page
    goToPage(page: number) {
        if (page >= 1 && page <= this.pageCount) {
            this.pagination.page = page
            this.getStockIns()
        }
    }
}
