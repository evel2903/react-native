import { injectable, inject } from 'inversiland'
import { makeAutoObservable } from 'mobx'
import StockInStoreState from '../../Types/StockInStoreState'
import GetStockInsPayload from '@/src/StockIn/Application/Types/GetStockInsPayload'
import GetStockInsUseCase from '@/src/StockIn/Application/UseCases/GetStockInsUseCase'
import CreateStockInUseCase from '@/src/StockIn/Application/UseCases/CreateStockInUseCase'
import StockInEntity from '@/src/StockIn/Domain/Entities/StockInEntity'
import CreateStockInPayload from '@/src/StockIn/Application/Types/CreateStockInPayload'
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
        status: undefined as undefined | 'pending' | 'completed' | 'cancelled',
        startDate: undefined,
        endDate: undefined,
        search: undefined,
    }
    pagination = {
        page: 1,
        pageSize: 10,
    }

    selectedStockIn: StockInEntity | null = null
    isCreating = false
    error: string | null = null

    // Form data with default values
    formData: CreateStockInPayload = {
        productId: '',
        productName: '',
        quantity: 0,
        unit: 'pc',
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD
        receivedBy: '',
        status: 'pending',
    }

    constructor(
        @inject(GetStockInsUseCase)
        private readonly getStockInsUseCase: GetStockInsUseCase,
        @inject(CreateStockInUseCase)
        private readonly createStockInUseCase: CreateStockInUseCase,
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

    setIsCreating = (isCreating: boolean) => {
        this.isCreating = isCreating
    }

    // Update form data
    updateFormData = (payload: Partial<CreateStockInPayload>) => {
        Object.assign(this.formData, payload)
    }

    // Reset form to default values
    resetForm = () => {
        this.formData = {
            productId: '',
            productName: '',
            quantity: 0,
            unit: 'pc',
            date: new Date().toISOString().split('T')[0],
            receivedBy: '',
            status: 'pending',
        }
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

    // Create new stock in
    async createStockIn() {
        this.setIsLoading(true)
        this.setError(null)

        try {
            // Validate form data
            if (
                !this.formData.productId ||
                !this.formData.productName ||
                this.formData.quantity <= 0
            ) {
                this.setError('Please fill all required fields')
                return null
            }

            const newStockIn = await this.createStockInUseCase.execute(
                this.formData
            )

            // Refresh the list to include new item
            await this.getStockIns()

            // Reset form
            this.resetForm()
            this.setIsCreating(false)

            return newStockIn
        } catch (error) {
            console.error('Error creating stock in:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to create stock in record'
            )
            return null
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
