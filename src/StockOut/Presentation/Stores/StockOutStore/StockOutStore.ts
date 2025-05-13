// src/StockOut/Presentation/Stores/StockOutStore/StockOutStore.ts
import { injectable, inject } from 'inversiland'
import { makeAutoObservable, runInAction } from 'mobx'
import StockOutStoreState from '../../Types/StockOutStoreState'
import GetStockOutsPayload from '@/src/StockOut/Application/Types/GetStockOutsPayload'
import StockOutEntity from '@/src/StockOut/Domain/Entities/StockOutEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'
import GetStockOutsUseCase from '@/src/StockOut/Application/UseCases/GetStockOutsUseCase'
import GetStockOutByIdUseCase from '@/src/StockOut/Application/UseCases/GetStockOutByIdUseCase'

@injectable()
export class StockOutStore implements StockOutStoreState {
    isLoading = false
    results: StockOutEntity[] = []
    count = 0
    filters = {
        code: undefined as string | undefined,
        status: undefined as
            | undefined
            | 'DRAFT'
            | 'PENDING'
            | 'APPROVED'
            | 'REJECTED'
            | 'CANCELLED',
        priority: undefined as PriorityType | undefined,
        receiverId: undefined as string | undefined,
        startDate: undefined as string | undefined,
        endDate: undefined as string | undefined,
        search: undefined as string | undefined,
    }
    pagination = {
        page: 1,
        pageSize: 10,
    }

    selectedStockOut: StockOutEntity | null = null
    error: string | null = null
    filterVisible = false

    constructor(
        @inject(GetStockOutsUseCase)
        private readonly getStockOutsUseCase: GetStockOutsUseCase,
        @inject(GetStockOutByIdUseCase)
        private readonly getStockOutByIdUseCase: GetStockOutByIdUseCase
    ) {
        makeAutoObservable(this)
        // Load stock outs on store initialization
        this.getStockOuts()
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

    setResults = (results: StockOutEntity[]) => {
        this.results = results
    }

    setCount = (count: number) => {
        this.count = count
    }

    setFilterVisible = (visible: boolean) => {
        this.filterVisible = visible
    }

    toggleFilterVisible = () => {
        this.filterVisible = !this.filterVisible
    }

    mergeFilters = (payload: Partial<StockOutStoreState['filters']>) => {
        Object.assign(this.filters, payload)
    }

    mergePagination = (
        payload: Partial<StockOutStoreState['pagination']>
    ): void => {
        Object.assign(this.pagination, payload)
    }

    setError = (error: string | null) => {
        this.error = error
    }

    setSelectedStockOut = (stockOut: StockOutEntity | null) => {
        this.selectedStockOut = stockOut
    }

    // Get stock outs with current filters and pagination
    async getStockOuts() {
        const payload: GetStockOutsPayload = {
            page: this.pagination.page,
            pageSize: this.pagination.pageSize,
            code: this.filters.code,
            status: this.filters.status,
            priority: this.filters.priority,
            receiverId: this.filters.receiverId,
            startDate: this.filters.startDate,
            endDate: this.filters.endDate,
            search: this.filters.search,
        }

        this.setIsLoading(true)
        this.setError(null)

        try {
            const response = await this.getStockOutsUseCase.execute(payload)

            runInAction(() => {
                this.setResults(response.results)
                this.setCount(response.count)
            })

            return response
        } catch (error) {
            console.error('Error fetching stock outs:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch stock outs'
                )
                // Ensure we clear any previous results
                this.setResults([])
                this.setCount(0)
            })

            return null
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Get stock out by ID using the use case
    async getStockOutById(id: string): Promise<StockOutEntity | null> {
        this.setIsLoading(true)
        this.setError(null)
        
        try {
            const stockOut = await this.getStockOutByIdUseCase.execute(id)
            
            runInAction(() => {
                this.setSelectedStockOut(stockOut)
            })
            
            return stockOut
        } catch (error) {
            console.error('Error fetching stock out details:', error)
            
            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch stock out details'
                )
                this.setSelectedStockOut(null)
            })
            
            return null
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Apply all filters at once
    applyFilters(filters: Partial<StockOutStoreState['filters']>) {
        this.mergeFilters(filters)
        this.pagination.page = 1
        this.getStockOuts()
    }

    // Reset filters
    resetFilters() {
        this.filters = {
            code: undefined,
            status: undefined,
            priority: undefined,
            receiverId: undefined,
            startDate: undefined,
            endDate: undefined,
            search: undefined,
        }
        this.pagination.page = 1
        this.getStockOuts()
    }

    // Go to page
    goToPage(page: number) {
        if (page >= 1 && page <= this.pageCount) {
            this.pagination.page = page
            this.getStockOuts()
        }
    }
}