import { injectable, inject } from 'inversiland'
import { makeAutoObservable, runInAction } from 'mobx'
import PickingStoreState from '../../Types/PickingStoreState'
import PickingOrderEntity, {
    PickingOrderItemEntity,
} from '@/src/Picking/Domain/Entities/PickingOrderEntity'
import {
    PickingOrderProcessEntity,
    PickingOrderProcessItemEntity,
} from '@/src/Picking/Domain/Entities/PickingOrderProcessEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'
import GetPickingOrdersUseCase from '@/src/Picking/Application/UseCases/GetPickingOrdersUseCase'
import GetPickingOrderByIdUseCase from '@/src/Picking/Application/UseCases/GetPickingOrderByIdUseCase'
import CreateOrUpdatePickingOrderItemUseCase from '@/src/Picking/Application/UseCases/CreateOrUpdatePickingOrderItemUseCase'
import GetPickingOrderProcessUseCase from '@/src/Picking/Application/UseCases/GetPickingOrderProcessUseCase'
import UpdatePickingOrderProcessItemUseCase from '@/src/Picking/Application/UseCases/UpdatePickingOrderProcessItemUseCase'
import CompletePickingOrderProcessUseCase from '@/src/Picking/Application/UseCases/CompletePickingOrderProcessUseCase'
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
    pickingOrderProcess: PickingOrderProcessEntity | null = null
    error: string | null = null
    filterVisible = false
    isProcessing = false
    processItems: PickingOrderProcessItemEntity[] = []
    pendingUpdates: Map<string, number> = new Map()

    constructor(
        @inject(GetPickingOrdersUseCase)
        private readonly getPickingOrdersUseCase: GetPickingOrdersUseCase,
        @inject(GetPickingOrderByIdUseCase)
        private readonly getPickingOrderByIdUseCase: GetPickingOrderByIdUseCase,
        @inject(CreateOrUpdatePickingOrderItemUseCase)
        private readonly createOrUpdatePickingOrderItemUseCase: CreateOrUpdatePickingOrderItemUseCase,
        @inject(GetPickingOrderProcessUseCase)
        private readonly getPickingOrderProcessUseCase: GetPickingOrderProcessUseCase,
        @inject(UpdatePickingOrderProcessItemUseCase)
        private readonly updatePickingOrderProcessItemUseCase: UpdatePickingOrderProcessItemUseCase,
        @inject(CompletePickingOrderProcessUseCase)
        private readonly completePickingOrderProcessUseCase: CompletePickingOrderProcessUseCase
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

    // Check if all requested items have been fully picked
    get isProcessComplete(): boolean {
        if (!this.processItems.length) return false

        return this.processItems.every(item => {
            const pendingValue = this.pendingUpdates.get(item.id)
            const quantityPicked =
                pendingValue !== undefined ? pendingValue : item.quantityPicked

            return (
                quantityPicked >= item.requestedQuantity ||
                quantityPicked >= item.quantityCanPicked
            )
        })
    }

    // Get overall picking progress percentage
    get processProgress(): number {
        if (!this.processItems.length) return 0

        let requestedTotal = 0
        let pickedTotal = 0

        this.processItems.forEach(item => {
            // Use the smallest value between requested and available
            const targetQty = Math.min(
                item.requestedQuantity,
                item.quantityCanPicked
            )
            requestedTotal += targetQty

            const pendingValue = this.pendingUpdates.get(item.id)
            const quantityPicked =
                pendingValue !== undefined ? pendingValue : item.quantityPicked

            pickedTotal += Math.min(quantityPicked, targetQty)
        })

        return requestedTotal > 0 ? pickedTotal / requestedTotal : 0
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

    setPickingOrderProcess = (process: PickingOrderProcessEntity | null) => {
        this.pickingOrderProcess = process
        if (process) {
            this.processItems = process.items
            // Reset pending updates when loading a new process
            this.pendingUpdates.clear()
        } else {
            this.processItems = []
            this.pendingUpdates.clear()
        }
    }

    setUpdatePickedQuantity = (itemId: string, quantity: number) => {
        this.pendingUpdates.set(itemId, quantity)
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
            const response = await this.getPickingOrdersUseCase.execute(payload)

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
            const pickingOrder = await this.getPickingOrderByIdUseCase.execute(
                id
            )

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

    // Get picking order process by ID
    async getPickingOrderProcess(id: string) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const process = await this.getPickingOrderProcessUseCase.execute(id)

            runInAction(() => {
                this.setPickingOrderProcess(process)
            })

            return process
        } catch (error) {
            console.error('Error fetching picking order process:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch picking order process'
                )
                this.setPickingOrderProcess(null)
            })

            return null
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Update picking order process item's picked quantity
    async updateProcessItemPickedQuantity(
        itemId: string,
        quantity: number
    ): Promise<boolean> {
        this.setIsProcessing(true)
        this.setError(null)

        try {
            // First, update local state to give immediate feedback
            runInAction(() => {
                this.setUpdatePickedQuantity(itemId, quantity)
            })

            // Then, update on the server
            const result =
                await this.updatePickingOrderProcessItemUseCase.execute({
                    id: itemId,
                    quantityPicked: quantity,
                })

            // Consider any non-null response as success
            // The use case already throws errors for failed API calls
            if (result !== null && result !== undefined) {
                runInAction(() => {
                    // Update the process item in the items array
                    const index = this.processItems.findIndex(
                        item => item.id === itemId
                    )
                    if (index !== -1) {
                        this.processItems[index] = {
                            ...this.processItems[index],
                            quantityPicked: quantity,
                            updatedQuantityPicked: quantity,
                        }
                    }

                    // Remove from pending updates
                    this.pendingUpdates.delete(itemId)
                })

                console.log(
                    `Successfully updated item ${itemId} to quantity ${quantity}`
                )
                return true // Return success for any valid response
            } else {
                console.error(`No response for update of item ${itemId}`)
                throw new Error(`Failed to update item ${itemId}`)
            }
        } catch (error) {
            console.error(`Error updating process item ${itemId}:`, error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : `Failed to update picked quantity for item ${itemId}`
                )

                // Important: remove from pending updates in case of error
                // to allow the user to try again
                this.pendingUpdates.delete(itemId)
            })

            return false // Return failure
        } finally {
            runInAction(() => {
                this.setIsProcessing(false)
            })
        }
    }

    // Complete the picking order process
    async completePickingOrderProcess(id: string) {
        this.setIsProcessing(true)
        this.setError(null)

        try {
            // Save any pending updates first
            const pendingPromises = Array.from(
                this.pendingUpdates.entries()
            ).map(([itemId, quantity]) =>
                this.updateProcessItemPickedQuantity(itemId, quantity)
            )

            await Promise.all(pendingPromises)

            // Then complete the process
            const result =
                await this.completePickingOrderProcessUseCase.execute(id)

            if (!result.success) {
                throw new Error(result.message)
            }

            return result
        } catch (error) {
            console.error('Error completing picking order process:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to complete picking order process'
                )
            })

            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to complete picking order process',
            }
        } finally {
            runInAction(() => {
                this.setIsProcessing(false)
            })
        }
    }

    // Create or update a picking order item
    async createOrUpdatePickingOrderItem(
        data: any
    ): Promise<PickingOrderItemEntity | null> {
        try {
            const item =
                await this.createOrUpdatePickingOrderItemUseCase.execute(data)
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
    async updatePickingOrderItems(
        items: any[]
    ): Promise<(PickingOrderItemEntity | null)[]> {
        try {
            const promises = items.map(item =>
                this.createOrUpdatePickingOrderItem(item)
            )
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
