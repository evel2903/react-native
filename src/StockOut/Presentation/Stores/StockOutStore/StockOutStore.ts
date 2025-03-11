import { injectable, inject } from 'inversiland'
import { makeAutoObservable } from 'mobx'
import StockOutStoreState from '../../Types/StockOutStoreState'
import GetStockOutsPayload from '@/src/StockOut/Application/Types/GetStockOutsPayload'
import GetStockOutsUseCase from '@/src/StockOut/Application/UseCases/GetStockOutsUseCase'
import CreateStockOutUseCase from '@/src/StockOut/Application/UseCases/CreateStockOutUseCase'
import StockOutEntity from '@/src/StockOut/Domain/Entities/StockOutEntity'
import CreateStockOutPayload from '@/src/StockOut/Application/Types/CreateStockOutPayload'
import {
    IStockOutRepository,
    IStockOutRepositoryToken,
} from '@/src/StockOut/Domain/Specifications/IStockOutRepository'

@injectable()
export class StockOutStore implements StockOutStoreState {
    isLoading = false
    results: StockOutEntity[] = []
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

    selectedStockOut: StockOutEntity | null = null
    isCreating = false
    error: string | null = null

    // Form data with default values
    formData: CreateStockOutPayload = {
        productId: '',
        productName: '',
        quantity: 0,
        unit: 'pc',
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD
        issuedBy: '',
        issuedTo: '',
        status: 'pending',
    }

    constructor(
        @inject(GetStockOutsUseCase)
        private readonly getStockOutsUseCase: GetStockOutsUseCase,
        @inject(CreateStockOutUseCase)
        private readonly createStockOutUseCase: CreateStockOutUseCase,
        @inject(IStockOutRepositoryToken)
        private readonly stockOutRepository: IStockOutRepository
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

    setResults = (results: StockOutEntity[]) => {
        this.results = results
    }

    setCount = (count: number) => {
        this.count = count
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

    setIsCreating = (isCreating: boolean) => {
        this.isCreating = isCreating
    }

    // Update form data
    updateFormData = (payload: Partial<CreateStockOutPayload>) => {
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
            issuedBy: '',
            issuedTo: '',
            status: 'pending',
        }
    }

    // Get stock outs with current filters and pagination
    async getStockOuts() {
        const payload: GetStockOutsPayload = {
            ...this.filters,
            ...this.pagination,
        }

        this.setIsLoading(true)
        this.setError(null)

        try {
            const response = await this.getStockOutsUseCase.execute(payload)
            this.setResults(response.results)
            this.setCount(response.count)
        } catch (error) {
            console.error('Error fetching stock outs:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch stock outs'
            )
        } finally {
            this.setIsLoading(false)
        }
    }

    // Create new stock out
    async createStockOut() {
        this.setIsLoading(true)
        this.setError(null)

        try {
            // Validate form data
            if (
                !this.formData.productId ||
                !this.formData.productName ||
                this.formData.quantity <= 0 ||
                !this.formData.issuedTo
            ) {
                this.setError('Please fill all required fields')
                return null
            }

            const newStockOut = await this.createStockOutUseCase.execute(
                this.formData
            )

            // Refresh the list to include new item
            await this.getStockOuts()

            // Reset form
            this.resetForm()
            this.setIsCreating(false)

            return newStockOut
        } catch (error) {
            console.error('Error creating stock out:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to create stock out record'
            )
            return null
        } finally {
            this.setIsLoading(false)
        }
    }

    // Get stock out details by ID
    async getStockOutDetails(id: string) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const stockOut = await this.stockOutRepository.getStockOutById(id)
            this.setSelectedStockOut(stockOut)
            return stockOut
        } catch (error) {
            console.error('Error fetching stock out details:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch stock out details'
            )
            return null
        } finally {
            this.setIsLoading(false)
        }
    }

    // Update stock out status
    async updateStatus(id: string, status: StockOutEntity['status']) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const updatedStockOut =
                await this.stockOutRepository.updateStockOutStatus(id, status)

            // Update in the results list if present
            const index = this.results.findIndex(item => item.id === id)
            if (index !== -1) {
                this.results[index] = updatedStockOut
            }

            // Update selected stock out if it's the current one
            if (this.selectedStockOut && this.selectedStockOut.id === id) {
                this.setSelectedStockOut(updatedStockOut)
            }

            return updatedStockOut
        } catch (error) {
            console.error('Error updating stock out status:', error)
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
    filterByStatus(status?: StockOutEntity['status']) {
        this.filters.status = status
        this.pagination.page = 1
        this.getStockOuts()
    }

    // Filter by date range
    filterByDateRange(startDate?: string, endDate?: string) {
        //this.filters.startDate = startDate;
        //this.filters.endDate = endDate;
        this.pagination.page = 1
        this.getStockOuts()
    }

    // Search
    search(query?: string) {
        //this.filters.search = query;
        this.pagination.page = 1
        this.getStockOuts()
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
