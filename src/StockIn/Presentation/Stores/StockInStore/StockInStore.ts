import { injectable, inject } from 'inversiland'
import { makeAutoObservable, runInAction } from 'mobx'
import StockInStoreState from '../../Types/StockInStoreState'
import GetStockInsPayload from '@/src/StockIn/Application/Types/GetStockInsPayload'
import StockInEntity from '@/src/StockIn/Domain/Entities/StockInEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'
import CreateStockInPayload from '@/src/StockIn/Application/Types/CreateStockInPayload'
import { GetCurrentApprovalStageUseCase } from '@/src/StockIn/Application/UseCases/GetCurrentApprovalStageUseCase'
import { CreateApprovalRequestUseCase } from '@/src/StockIn/Application/UseCases/CreateApprovalRequestUseCase'
import { ApprovalStage } from '@/src/StockIn/Domain/Entities/ApprovalStage'
import GetStockInsUseCase from '@/src/StockIn/Application/UseCases/GetStockInsUseCase'
import CreateStockInUseCase from '@/src/StockIn/Application/UseCases/CreateStockInUseCase'
import GetStockInByIdUseCase from '@/src/StockIn/Application/UseCases/GetStockInByIdUseCase'
import UpdateStockInStatusUseCase from '@/src/StockIn/Application/UseCases/UpdateStockInStatusUseCase'
import DeleteStockInUseCase from '@/src/StockIn/Application/UseCases/DeleteStockInUseCase'
import UpdateStockInUseCase from '@/src/StockIn/Application/UseCases/UpdateStockInUseCase'
import { ApprovalDecision } from '@/src/StockIn/Domain/Entities/ApprovalDecision'
import { CreateApprovalDecisionUseCase } from '@/src/StockIn/Application/UseCases/CreateApprovalDecisionUseCase'
import { GetApprovalRequestIdUseCase } from '@/src/StockIn/Application/UseCases/GetApprovalRequestIdUseCase'

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

    // Approval workflow state
    isApprovalProcessing = false
    approvalError: string | null = null
    currentApprovalStage: ApprovalStage | null = null
    approvalDecision: ApprovalDecision | null = null

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
        @inject(GetStockInsUseCase)
        private readonly getStockInsUseCase: GetStockInsUseCase,
        @inject(CreateStockInUseCase)
        private readonly createStockInUseCase: CreateStockInUseCase,
        @inject(GetStockInByIdUseCase)
        private readonly getStockInByIdUseCase: GetStockInByIdUseCase,
        @inject(UpdateStockInStatusUseCase)
        private readonly updateStockInStatusUseCase: UpdateStockInStatusUseCase,
        @inject(DeleteStockInUseCase)
        private readonly deleteStockInUseCase: DeleteStockInUseCase,
        @inject(UpdateStockInUseCase)
        private readonly updateStockInUseCase: UpdateStockInUseCase,
        @inject(GetCurrentApprovalStageUseCase)
        private readonly getCurrentApprovalStageUseCase: GetCurrentApprovalStageUseCase,
        @inject(CreateApprovalRequestUseCase)
        private readonly createApprovalRequestUseCase: CreateApprovalRequestUseCase,
        @inject(CreateApprovalDecisionUseCase)
        private readonly createApprovalDecisionUseCase: CreateApprovalDecisionUseCase,
        @inject(GetApprovalRequestIdUseCase)
        private readonly getApprovalRequestIdUseCase: GetApprovalRequestIdUseCase
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
            const response = await this.getStockInsUseCase.execute(payload)

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
            const stockIn = await this.getStockInByIdUseCase.execute(id)

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

            const stockIn = await this.createStockInUseCase.execute(data as any)

            runInAction(() => {
                // Always add the new stock in to the results, regardless of current list state
                this.results = [stockIn, ...this.results]
                this.count = this.count + 1

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
    async updateStatus(
        id: string,
        status: 'completed' | 'cancelled',
        stateId: ''
    ) {
        this.setIsLoading(true)
        this.setError(null)

        // Map the simplified status to the actual API status value
        const apiStatus = status === 'completed' ? 'APPROVED' : 'CANCELLED'

        try {
            const updatedStockIn =
                await this.updateStockInStatusUseCase.execute({
                    id,
                    status: apiStatus as StockInEntity['status'],
                    stateId: stateId,
                })

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
            const success = await this.deleteStockInUseCase.execute(id)

            if (success) {
                runInAction(() => {
                    // Remove from the results list if present
                    this.results = this.results.filter(item => item.id !== id)
                    this.count = this.count - 1

                    // If it was the selected one, clear selection
                    if (
                        this.selectedStockIn &&
                        this.selectedStockIn.id === id
                    ) {
                        this.setSelectedStockIn(null)
                    }
                })

                return true
            } else {
                throw new Error('Failed to delete stock in record')
            }
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

    // Update stock in
    async updateStockIn(id: string, payload: any) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const updatedStockIn = await this.updateStockInUseCase.execute({
                id,
                data: payload,
            })

            runInAction(() => {
                // Update in the results list if present
                const index = this.results.findIndex(item => item.id === id)
                if (index !== -1) {
                    this.results[index] = updatedStockIn
                }

                // Update selected stock in
                this.setSelectedStockIn(updatedStockIn)
            })

            return updatedStockIn
        } catch (error) {
            console.error('Error updating stock in:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to update stock in'
                )
            })

            return null
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Get current approval stage
    async getCurrentApprovalStage(resourceName: string, stockStatus: string) {
        runInAction(() => {
            this.isApprovalProcessing = true
            this.approvalError = null
        })

        try {
            const stage = await this.getCurrentApprovalStageUseCase.execute({
                resourceName,
                stockStatus,
            })

            runInAction(() => {
                this.currentApprovalStage = stage
            })

            return stage
        } catch (error) {
            console.error('Error getting current approval stage:', error)

            runInAction(() => {
                this.approvalError =
                    error instanceof Error
                        ? error.message
                        : 'Failed to get current approval stage'
            })

            return null
        } finally {
            runInAction(() => {
                this.isApprovalProcessing = false
            })
        }
    }

    // Request approval for a stock in
    async requestApproval(stockInId: string, userId: string) {
        runInAction(() => {
            this.isApprovalProcessing = true
            this.approvalError = null
        })

        try {
            // First get the current stage
            const stage = await this.getCurrentApprovalStage(
                'stockins',
                'DRAFT'
            )

            if (!stage) {
                throw new Error('Could not determine current approval stage')
            }

            // Then create the approval request
            const approvalRequest =
                await this.createApprovalRequestUseCase.execute({
                    objectId: stockInId,
                    currentStageId: stage.id,
                    objectType: 'StockIn',
                    requesterId: userId,
                })

            // If approval request was successful, update the stock in status
            if (approvalRequest && approvalRequest.status) {
                // Update the stock status to match the approval request status
                await this.updateStockInStatusUseCase.execute({
                    id: stockInId,
                    status: approvalRequest.status as StockInEntity['status'],
                    stateId: stage.id,
                })
            }

            // Refresh the stock in details to get updated status
            await this.getStockInDetails(stockInId)

            // Refresh the list
            await this.getStockIns()

            return approvalRequest
        } catch (error) {
            console.error('Error requesting approval:', error)

            runInAction(() => {
                this.approvalError =
                    error instanceof Error
                        ? error.message
                        : 'Failed to request approval'
            })

            return null
        } finally {
            runInAction(() => {
                this.isApprovalProcessing = false
            })
        }
    }

    // Approve stock in
    async approveStockIn(id: string, requestId: string, approverId: string) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            // Create approval decision
            const decision = await this.createApprovalDecisionUseCase.execute({
                requestId,
                approverId,
                comment: 'Request approved successfully',
            })

            // Store the approval decision
            runInAction(() => {
                this.approvalDecision = decision
            })

            // Update the stock status if necessary
            if (decision && decision.requestStatus === 'APPROVED') {
                const updatedStockIn =
                    await this.updateStockInStatusUseCase.execute({
                        id,
                        status: 'APPROVED' as StockInEntity['status'],
                        stateId: decision.stageId,
                    })

                runInAction(() => {
                    // Update in the results list if present
                    const index = this.results.findIndex(item => item.id === id)
                    if (index !== -1) {
                        this.results[index] = updatedStockIn
                    }

                    // Update selected stock in if it's the current one
                    if (
                        this.selectedStockIn &&
                        this.selectedStockIn.id === id
                    ) {
                        this.setSelectedStockIn(updatedStockIn)
                    }
                })
            }

            // Refresh the list to get updated data
            await this.getStockIns()

            return true
        } catch (error) {
            console.error('Error approving stock in:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to approve stock in'
                )
            })

            return false
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Reject stock in
    async rejectStockIn(id: string) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            // Update status to REJECTED
            const updatedStockIn =
                await this.updateStockInStatusUseCase.execute({
                    id,
                    status: 'REJECTED' as StockInEntity['status'],
                    stateId: '',
                })

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

            // Refresh the list to get updated data
            await this.getStockIns()

            return true
        } catch (error) {
            console.error('Error rejecting stock in:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to reject stock in'
                )
            })

            return false
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Get approval request ID
    async getApprovalRequestId(objectId: string): Promise<string | null> {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const requestId = await this.getApprovalRequestIdUseCase.execute({
                objectId,
                objectType: 'StockIn',
            })

            if (!requestId) {
                console.warn(
                    `No approval request ID found for stock in ${objectId}`
                )
            }

            return requestId
        } catch (error) {
            console.error('Error fetching approval request ID:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch approval request ID'
                )
            })

            return null
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
