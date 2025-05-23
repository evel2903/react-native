import { injectable, inject } from 'inversiland'
import { makeAutoObservable, runInAction } from 'mobx'
import StorageStoreState from '../../Types/StorageStoreState'
import StorageVoucherEntity, {
    StorageVoucherItemEntity,
} from '@/src/Storage/Domain/Entities/StorageVoucherEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'
import GetStorageVouchersUseCase from '@/src/Storage/Application/UseCases/GetStorageVouchersUseCase'
import GetStorageVoucherByIdUseCase from '@/src/Storage/Application/UseCases/GetStorageVoucherByIdUseCase'
import ProcessStorageVoucherUseCase from '@/src/Storage/Application/UseCases/ProcessStorageVoucherUseCase'
import SendProcessCompletedEmailUseCase from '@/src/Storage/Application/UseCases/SendProcessCompletedEmailUseCase'
import { GetStorageVouchersPayload } from '@/src/Storage/Domain/Specifications/IStorageRepository'
import CreateOrUpdateStorageVoucherItemUseCase from '@/src/Storage/Application/UseCases/CreateOrUpdateStorageVoucherItemUseCase'

@injectable()
export class StorageStore implements StorageStoreState {
    isLoading = false
    results: StorageVoucherEntity[] = []
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
        storageDateStart: undefined as string | undefined,
        storageDateEnd: undefined as string | undefined,
        search: undefined as string | undefined,
    }
    pagination = {
        page: 1,
        pageSize: 10,
    }

    selectedStorageVoucher: StorageVoucherEntity | null = null
    error: string | null = null
    filterVisible = false
    isProcessing = false

    constructor(
        @inject(GetStorageVouchersUseCase)
        private readonly getStorageVouchersUseCase: GetStorageVouchersUseCase,
        @inject(GetStorageVoucherByIdUseCase)
        private readonly getStorageVoucherByIdUseCase: GetStorageVoucherByIdUseCase,
        @inject(ProcessStorageVoucherUseCase)
        private readonly processStorageVoucherUseCase: ProcessStorageVoucherUseCase,
        @inject(SendProcessCompletedEmailUseCase)
        private readonly sendProcessCompletedEmailUseCase: SendProcessCompletedEmailUseCase,
        @inject(CreateOrUpdateStorageVoucherItemUseCase)
        private readonly createOrUpdateStorageVoucherItemUseCase: CreateOrUpdateStorageVoucherItemUseCase
    ) {
        makeAutoObservable(this)
        // Load storage vouchers on store initialization
        this.getStorageVouchers()
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

    setResults = (results: StorageVoucherEntity[]) => {
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

    mergeFilters = (payload: Partial<StorageStoreState['filters']>) => {
        Object.assign(this.filters, payload)
    }

    mergePagination = (
        payload: Partial<StorageStoreState['pagination']>
    ): void => {
        Object.assign(this.pagination, payload)
    }

    setError = (error: string | null) => {
        this.error = error
    }

    setSelectedStorageVoucher = (voucher: StorageVoucherEntity | null) => {
        this.selectedStorageVoucher = voucher
    }

    // Get storage vouchers with current filters and pagination
    async getStorageVouchers() {
        const payload: GetStorageVouchersPayload = {
            page: this.pagination.page,
            pageSize: this.pagination.pageSize,
            code: this.filters.code,
            status: this.filters.status,
            priority: this.filters.priority,
            assignedTo: this.filters.assignedTo,
            storageDateStart: this.filters.storageDateStart,
            storageDateEnd: this.filters.storageDateEnd,
            search: this.filters.search,
        }

        this.setIsLoading(true)
        this.setError(null)

        try {
            const response = await this.getStorageVouchersUseCase.execute(
                payload
            )

            runInAction(() => {
                this.setResults(response.results)
                this.setCount(response.count)
            })

            return response
        } catch (error) {
            console.error('Error fetching storage vouchers:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch storage vouchers'
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

    // Get storage voucher details by ID
    async getStorageVoucherDetails(id: string) {
        this.setIsLoading(true)
        this.setError(null)

        try {
            const storageVoucher =
                await this.getStorageVoucherByIdUseCase.execute(id)

            runInAction(() => {
                this.setSelectedStorageVoucher(storageVoucher)
            })

            return storageVoucher
        } catch (error) {
            console.error('Error fetching storage voucher details:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch storage voucher details'
                )
                this.setSelectedStorageVoucher(null)
            })

            return null
        } finally {
            runInAction(() => {
                this.setIsLoading(false)
            })
        }
    }

    // Process a storage voucher
    async processStorageVoucher(id: string) {
        this.setIsProcessing(true)
        this.setError(null)

        try {
            const processedVoucher =
                await this.processStorageVoucherUseCase.execute(id)

            runInAction(() => {
                // Update in the results list if present
                const index = this.results.findIndex(item => item.id === id)
                if (index !== -1) {
                    this.results[index] = processedVoucher
                }

                // Update selected storage voucher if it's the current one
                if (
                    this.selectedStorageVoucher &&
                    this.selectedStorageVoucher.id === id
                ) {
                    this.setSelectedStorageVoucher(processedVoucher)
                }
            })

            return processedVoucher
        } catch (error) {
            console.error('Error processing storage voucher:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to process storage voucher'
                )
            })

            return null
        } finally {
            runInAction(() => {
                this.setIsProcessing(false)
            })
        }
    }

    // Send email notification when processing is completed
    async sendProcessCompletedEmail(id: string) {
        this.setIsProcessing(true)
        this.setError(null)

        try {
            const result = await this.sendProcessCompletedEmailUseCase.execute(
                id
            )

            return result
        } catch (error) {
            console.error('Error sending process completed email:', error)

            runInAction(() => {
                this.setError(
                    error instanceof Error
                        ? error.message
                        : 'Failed to send process completed email'
                )
            })

            return null
        } finally {
            runInAction(() => {
                this.setIsProcessing(false)
            })
        }
    }

    // Create or update a storage voucher item
    async createOrUpdateStorageVoucherItem(
        data: any
    ): Promise<StorageVoucherItemEntity | null> {
        try {
            const item =
                await this.createOrUpdateStorageVoucherItemUseCase.execute(data)
            return item
        } catch (error) {
            console.error(
                'Error creating/updating storage voucher item:',
                error
            )
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to create/update storage voucher item'
            )
            return null
        }
    }

    // Update multiple storage voucher items
    async updateStorageVoucherItems(
        items: any[]
    ): Promise<(StorageVoucherItemEntity | null)[]> {
        try {
            const promises = items.map(item =>
                this.createOrUpdateStorageVoucherItem(item)
            )
            return await Promise.all(promises)
        } catch (error) {
            console.error(
                'Error updating multiple storage voucher items:',
                error
            )
            this.setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to update storage voucher items'
            )
            return []
        }
    }

    // Filter methods
    applyFilters(filters: Partial<StorageStoreState['filters']>) {
        this.mergeFilters(filters)
        this.pagination.page = 1
        this.getStorageVouchers()
    }

    // Reset filters
    resetFilters() {
        this.filters = {
            code: undefined,
            status: undefined,
            priority: undefined,
            assignedTo: undefined,
            storageDateStart: undefined,
            storageDateEnd: undefined,
            search: undefined,
        }
        this.pagination.page = 1
        this.getStorageVouchers()
    }

    // Go to page
    goToPage(page: number) {
        if (page >= 1 && page <= this.pageCount) {
            this.pagination.page = page
            this.getStorageVouchers()
        }
    }
}
