import { injectable, inject } from 'inversiland'
import { makeAutoObservable } from 'mobx'
import GetInventoryStoreState from '../../Types/GetInventoryStoreState'
import GetInventoryPayload from '@/src/Inventory/Application/Types/GetInventoryPayload'
import GetInventoryUseCase from '@/src/Inventory/Application/UseCases/GetInventoryUseCase'

@injectable()
export class GetInventoryStore implements GetInventoryStoreState {
    isLoading = false
    results = [] as GetInventoryStoreState['results']
    count = 0
    filters = {
        category: undefined,
        search: undefined,
        sortBy: 'name',
        sortOrder: 'asc' as 'asc' | 'desc',
    }
    pagination = {
        page: 1,
        pageSize: 10,
    }

    constructor(
        @inject(GetInventoryUseCase)
        private readonly getInventoryUseCase: GetInventoryUseCase
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

    setResults = (results: GetInventoryStoreState['results']) => {
        this.results = results
    }

    setCount = (count: GetInventoryStoreState['count']) => {
        this.count = count
    }

    mergeFilters = (payload: Partial<GetInventoryStoreState['filters']>) => {
        Object.assign(this.filters, payload)
    }

    mergePagination = (
        payload: Partial<GetInventoryStoreState['pagination']>
    ): void => {
        Object.assign(this.pagination, payload)
    }

    async getInventory() {
        const payload: GetInventoryPayload = {
            ...this.filters,
            ...this.pagination,
        }

        this.setIsLoading(true)

        return this.getInventoryUseCase
            .execute(payload)
            .then(response => {
                this.setResults(response.results)
                this.setCount(response.count)
            })
            .catch(error => {
                console.error('Error fetching inventory:', error)
            })
            .finally(() => {
                this.setIsLoading(false)
            })
    }

    // Reset filters and refresh data
    resetFilters() {
        this.filters = {
            category: undefined,
            search: undefined,
            sortBy: 'name',
            sortOrder: 'asc',
        }
        this.pagination.page = 1
        this.getInventory()
    }

    // Handle search
    search(query: string) {
        //this.filters.search = query;
        this.pagination.page = 1
        this.getInventory()
    }

    // Handle category filter
    filterByCategory(category?: string) {
        //this.filters.category = category;
        this.pagination.page = 1
        this.getInventory()
    }

    // Handle sorting
    sort(field: string) {
        if (this.filters.sortBy === field) {
            // Toggle sort order if the same field
            this.filters.sortOrder =
                this.filters.sortOrder === 'asc' ? 'desc' : 'asc'
        } else {
            // New field, default to ascending
            this.filters.sortBy = field
            this.filters.sortOrder = 'asc'
        }
        this.getInventory()
    }

    // Handle pagination
    goToPage(page: number) {
        if (page >= 1 && page <= this.pageCount) {
            this.pagination.page = page
            this.getInventory()
        }
    }
}
