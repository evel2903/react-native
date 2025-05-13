import { injectable, inject } from 'inversiland'
import { makeAutoObservable, runInAction } from 'mobx'
import PickingStoreState from '../../Types/PickingStoreState'
import PickingOrderEntity, { PickingOrderItemEntity } from '@/src/Picking/Domain/Entities/PickingOrderEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'
import GetPickingOrdersUseCase from '@/src/Picking/Application/UseCases/GetPickingOrdersUseCase'
import GetPickingOrderByIdUseCase from '@/src/Picking/Application/UseCases/GetPickingOrderByIdUseCase'
import CreateOrUpdatePickingOrderItemUseCase from '@/src/Picking/Application/UseCases/CreateOrUpdatePickingOrderItemUseCase'
import { GetPickingOrdersPayload } from '@/src/Picking/Domain/Specifications/IPickingRepository'

@injectable()
export class PickingStore implements PickingStoreState {
    isLoading = false
    results: PickingOrderEntity[] = []
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
        assignedTo: undefined as string | undefined,
        pickingDateStart: undefined as string | undefined,
        pickingDateEnd: undefined as string | undefined,
        search: undefined as string | undefined,
    }
    pagination = {
        page: 1,
        pageSize: 10,
    }

    selectedPickingOrder: PickingOrderEntity | null = null
    error: string | null = null
    filterVisible = false
    isProcessing = false

    constructor(
        @inject(GetPickingOrdersUseCase)
        private readonly getPickingOrdersUseCase: GetPickingOrdersUseCase,
        @inject(GetPickingOrderByIdUseCase)
        private readonly getPickingOrderByIdUseCase: GetPickingOrderByIdUseCase,
        @inject(CreateOrUpdatePickingOrderItemUseCase)
        private readonly createOrUpdatePickingOrderItemUseCase: CreateOrUpdatePickingOrderItemUseCase
    ) {
        makeAutoObservable(this)
        // Load picking orders on store initialization
        this.getPickingOrders()
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

    setIsProcessing = (isProcessing: boolean) => {
        this.isProcessing = isProcessing
    }

    setResults = (results: PickingOrderEntity[]) => {
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

    mergeFilters = (payload: Partial<PickingStoreState['filters']>) => {
        Object.assign(this.filters, payload)
    }

    mergePagination = (
        payload: Partial<PickingStoreState['pagination']>
    ): void => {
        Object.assign(this.pagination, payload)
    }

    setError = (error: string | null) => {
        this.error = error
    }

    setSelectedPickingOrder = (order: PickingOrderEntity | null) => {
        this.selectedPickingOrder = order
    }

    // Get picking orders with current filters and pagination
    async getPickingOrders() {
        const payload: GetPickingOrdersPayload = {
            page: this.pagination.page,
            pageSize: this.pagination.pageSize,
            code: this.filters.code,
            status: this.filters.status,
            priority: this.filters.priority,
            assignedTo: this.filters.assignedTo,
            pickingDateStart: this.filters.pickingDateStart,
            pickingDateEnd: this.filters.pickingDateEnd,
            search: this.filters.search,
        }

        this.setIsLoading(true)
        this.setError(null)

        try {
            const response = await this.getPickingOrdersUseCase.execute(
                payload
            )

            runInAction(() => {
                this.setResults(response.results)
                this.setCount(response.count)
            })

            return response
        } catch (error) {
            console.error('Error fetching picking orders:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch picking orders'
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

    // Get picking order details by ID
    async getPickingOrderDetails(id: string) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const pickingOrder =
                await this.getPickingOrderByIdUseCase.execute(id)

            runInAction(() => {
                this.setSelectedPickingOrder(pickingOrder)
            })

            return pickingOrder
        } catch (error) {
            console.error('Error fetching picking order details:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch picking order details'
                )
                this.setSelectedPickingOrder(null)
            })

            return null
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Create or update a picking order item
    async createOrUpdatePickingOrderItem(data: any): Promise<PickingOrderItemEntity | null> {
        try {
            const item = await this.createOrUpdatePickingOrderItemUseCase.execute(data)
            return item
        } catch (error) {
            console.error('Error creating/updating picking order item:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to create/update picking order item'
            )
            return null
        }
    }

    // Update multiple picking order items
    async updatePickingOrderItems(items: any[]): Promise<(PickingOrderItemEntity | null)[]> {
        try {
            const promises = items.map(item => this.createOrUpdatePickingOrderItem(item))
            return await Promise.all(promises)
        } catch (error) {
            console.error('Error updating multiple picking order items:', error)
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update picking order items'
            )
            return []
        }
    }

    // Filter methods
    applyFilters(filters: Partial<PickingStoreState['filters']>) {
        this.mergeFilters(filters)
        this.pagination.page = 1
        this.getPickingOrders()
    }

    // Reset filters
    resetFilters() {
        this.filters = {
            code: undefined,
            status: undefined,
            priority: undefined,
            assignedTo: undefined,
            pickingDateStart: undefined,
            pickingDateEnd: undefined,
            search: undefined,
        }
        this.pagination.page = 1
        this.getPickingOrders()
    }

    // Go to page
    goToPage(page: number) {
        if (page >= 1 && page <= this.pageCount) {
            this.pagination.page = page
            this.getPickingOrders()
        }
    }
}