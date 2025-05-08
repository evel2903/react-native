import { injectable, inject } from 'inversiland'
import { makeAutoObservable, runInAction } from 'mobx'
import StockInStoreState from '../../Types/StockInStoreState'
import GetStockInsPayload from '@/src/StockIn/Application/Types/GetStockInsPayload'
import StockInEntity from '@/src/StockIn/Domain/Entities/StockInEntity'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '@/src/StockIn/Domain/Specifications/IStockInRepository'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'
import CreateStockInPayload from '@/src/StockIn/Application/Types/CreateStockInPayload'

@injectable()
export class StockInStore implements StockInStoreState {
    isLoading = false
    results: StockInEntity[] = []
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
        supplierId: undefined as string | undefined,
        lotNumber: undefined as string | undefined,
        startDate: undefined as string | undefined,
        endDate: undefined as string | undefined,
        search: undefined as string | undefined,
    }
    pagination = {
        page: 1,
        pageSize: 10,
    }

    selectedStockIn: StockInEntity | null = null
    error: string | null = null
    filterVisible = false

    // Form data for creating new stock in
    formData: CreateStockInPayload = {
        productId: '',
        productName: '',
        quantity: 0,
        unit: '',
        date: new Date().toISOString().split('T')[0],
        receivedBy: '',
        supplierName: '',
        supplierInvoice: '',
        notes: '',
        status: 'pending',
    }

    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {
        makeAutoObservable(this)
        // Load stock ins on store initialization
        this.getStockIns()
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

    setFilterVisible = (visible: boolean) => {
        this.filterVisible = visible
    }

    toggleFilterVisible = () => {
        this.filterVisible = !this.filterVisible
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

    updateFormData = (payload: Partial<CreateStockInPayload>) => {
        Object.assign(this.formData, payload)
    }

    // Get stock ins with current filters and pagination
    async getStockIns() {
        const payload: GetStockInsPayload = {
            page: this.pagination.page,
            pageSize: this.pagination.pageSize,
            code: this.filters.code,
            status: this.filters.status,
            priority: this.filters.priority,
            supplierId: this.filters.supplierId,
            lotNumber: this.filters.lotNumber,
            startDate: this.filters.startDate,
            endDate: this.filters.endDate,
            search: this.filters.search,
        }

        this.setIsLoading(true)
        this.setError(null)

        try {
            const response = await this.stockInRepository.getStockIns(payload)

            runInAction(() => {
                this.setResults(response.results)
                this.setCount(response.count)
            })

            return response
        } catch (error) {
            console.error('Error fetching stock ins:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch stock ins'
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

    // Get stock in details by ID
    async getStockInDetails(id: string) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const stockIn = await this.stockInRepository.getStockInById(id)

            runInAction(() => {
                this.setSelectedStockIn(stockIn)
            })

            return stockIn
        } catch (error) {
            console.error('Error fetching stock in details:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch stock in details'
                )
                this.setSelectedStockIn(null)
            })

            return null
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Create new stock in
    async createStockIn(payload?: Record<string, any>) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            // If payload is provided, use it; otherwise use the store's formData
            const data = payload || this.formData

            const stockIn = await this.stockInRepository.createStockIn(data)

            runInAction(() => {
                // Add the new stock in to the results if appropriate
                if (this.results.length > 0) {
                    this.results = [stockIn, ...this.results]
                    this.count = this.count + 1
                }

                // Reset form data
                this.formData = {
                    productId: '',
                    productName: '',
                    quantity: 0,
                    unit: '',
                    date: new Date().toISOString().split('T')[0],
                    receivedBy: '',
                    supplierName: '',
                    supplierInvoice: '',
                    notes: '',
                    status: 'pending',
                }
            })

            return stockIn
        } catch (error) {
            console.error('Error creating stock in:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to create stock in'
                )
            })

            return null
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Update stock in status
    async updateStatus(id: string, status: 'completed' | 'cancelled') {
        this.setIsLoading(true)
        this.setError(null)

        // Map the simplified status to the actual API status value
        const apiStatus = status === 'completed' ? 'APPROVED' : 'CANCELLED'

        try {
            const updatedStockIn =
                await this.stockInRepository.updateStockInStatus(
                    id,
                    apiStatus as StockInEntity['status']
                )

            runInAction(() => {
                // Update in the results list if present
                const index = this.results.findIndex(item => item.id === id)
                if (index !== -1) {
                    this.results[index] = updatedStockIn
                }

                // Update selected stock in if it's the current one
                if (this.selectedStockIn && this.selectedStockIn.id === id) {
                    this.setSelectedStockIn(updatedStockIn)
                }
            })

            return updatedStockIn
        } catch (error) {
            console.error('Error updating stock in status:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to update status'
                )
            })

            return null
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }
    // Delete stock in
    async deleteStockIn(id: string) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            // Call HTTP client directly as there's no repository method
            const url = `/api/stock-in/${id}`

            // Get the HTTP client from repository to maintain consistency
            await this.stockInRepository.deleteStockIn

            runInAction(() => {
                // Remove from the results list if present
                this.results = this.results.filter(item => item.id !== id)
                this.count = this.count - 1

                // If it was the selected one, clear selection
                if (this.selectedStockIn && this.selectedStockIn.id === id) {
                    this.setSelectedStockIn(null)
                }
            })

            return true
        } catch (error) {
            console.error('Error deleting stock in:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete stock in record'
                )
            })

            return false
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Filter methods for each filter type
    filterByCode(code?: string) {
        this.filters.code = code
        this.pagination.page = 1
        this.getStockIns()
    }

    filterByStatus(status?: StockInEntity['status']) {
        this.filters.status = status
        this.pagination.page = 1
        this.getStockIns()
    }

    filterByPriority(priority?: PriorityType) {
        this.filters.priority = priority
        this.pagination.page = 1
        this.getStockIns()
    }

    filterBySupplier(supplierId?: string) {
        this.filters.supplierId = supplierId
        this.pagination.page = 1
        this.getStockIns()
    }

    filterByLotNumber(lotNumber?: string) {
        this.filters.lotNumber = lotNumber
        this.pagination.page = 1
        this.getStockIns()
    }

    // Filter by date range
    filterByDateRange(startDate?: string, endDate?: string) {
        this.filters.startDate = startDate
        this.filters.endDate = endDate
        this.pagination.page = 1
        this.getStockIns()
    }

    // Apply all filters at once
    applyFilters(filters: Partial<StockInStoreState['filters']>) {
        this.mergeFilters(filters)
        this.pagination.page = 1
        this.getStockIns()
    }

    // Search
    search(query?: string) {
        this.filters.search = query && query.length > 0 ? query : undefined
        this.pagination.page = 1
        this.getStockIns()
    }

    // Reset filters
    resetFilters() {
        this.filters = {
            code: undefined,
            status: undefined,
            priority: undefined,
            supplierId: undefined,
            lotNumber: undefined,
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
