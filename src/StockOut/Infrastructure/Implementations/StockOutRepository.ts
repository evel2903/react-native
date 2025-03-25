import { injectable, inject } from 'inversiland'
import { IStockOutRepository } from '../../Domain/Specifications/IStockOutRepository'
import GetStockOutsPayload from '../../Application/Types/GetStockOutsPayload'
import CreateStockOutPayload from '../../Application/Types/CreateStockOutPayload'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'
import StockOutDto from '../Models/StockOutDto'
import { plainToInstance } from 'class-transformer'
import IHttpClient, {
    IHttpClientToken,
} from 'src/Core/Domain/Specifications/IHttpClient'
import { v4 as uuidv4 } from 'uuid'

@injectable()
class StockOutRepository implements IStockOutRepository {
    private readonly baseUrl = '/api/stock-out'

    // Mock data for demo
    private mockStockOuts: any[] = [
        {
            id: 'so-001',
            reference: 'SO-2025-001',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            issuedBy: 'John Doe',
            issuedTo: 'IT Department',
            reason: 'Equipment upgrade',
            notes: 'Delivered to 3rd floor',
            status: 'completed',
            products: [
                {
                    productId: 'prod-001',
                    productName: 'Laptop Dell XPS 13',
                    quantity: 2,
                    unit: 'pc',
                    price: 1200,
                },
                {
                    productId: 'prod-007',
                    productName: 'External SSD 1TB',
                    quantity: 5,
                    unit: 'pc',
                    price: 120,
                },
            ],
            totalItems: 7,
        },
        {
            id: 'so-002',
            reference: 'SO-2025-002',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            issuedBy: 'Jane Smith',
            issuedTo: 'Sales Team',
            reason: 'New employee onboarding',
            status: 'completed',
            products: [
                {
                    productId: 'prod-003',
                    productName: 'iPhone 15 Pro',
                    quantity: 3,
                    unit: 'pc',
                    price: 999,
                },
                {
                    productId: 'prod-004',
                    productName: 'Samsung Galaxy S23',
                    quantity: 2,
                    unit: 'pc',
                    price: 899,
                },
            ],
            totalItems: 5,
        },
        {
            id: 'so-003',
            reference: 'SO-2025-003',
            date: new Date().toISOString(), // Today
            issuedBy: 'Robert Johnson',
            issuedTo: 'Marketing Department',
            reason: 'Work from home equipment',
            status: 'pending',
            products: [
                {
                    productId: 'prod-005',
                    productName: 'Sony WH-1000XM5 Headphones',
                    quantity: 3,
                    unit: 'pc',
                    price: 349,
                },
            ],
            totalItems: 3,
        },
    ]

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async getStockOuts(
        payload: GetStockOutsPayload
    ): Promise<{ results: StockOutEntity[]; count: number }> {
        // In a real app, this would be an API call
        // For demo, we'll filter the mock data

        let filteredData = [...this.mockStockOuts]

        // Apply status filter
        if (payload.status) {
            filteredData = filteredData.filter(
                item => item.status === payload.status
            )
        }

        // Apply date range filter
        if (payload.startDate) {
            const startDate = new Date(payload.startDate)
            filteredData = filteredData.filter(
                item => new Date(item.date) >= startDate
            )
        }
        if (payload.endDate) {
            const endDate = new Date(payload.endDate)
            filteredData = filteredData.filter(
                item => new Date(item.date) <= endDate
            )
        }

        // Apply search filter
        if (payload.search) {
            const searchLower = payload.search.toLowerCase()
            filteredData = filteredData.filter(
                item =>
                    item.reference.toLowerCase().includes(searchLower) ||
                    item.issuedTo.toLowerCase().includes(searchLower) ||
                    item.reason?.toLowerCase().includes(searchLower) ||
                    item.notes?.toLowerCase().includes(searchLower) ||
                    item.products.some(
                        (product: any) =>
                            product.productName
                                .toLowerCase()
                                .includes(searchLower) ||
                            product.productId
                                .toLowerCase()
                                .includes(searchLower)
                    )
            )
        }

        // Get the total count before pagination
        const count = filteredData.length

        // Apply pagination
        const startIndex = (payload.page - 1) * payload.pageSize
        const endIndex = startIndex + payload.pageSize
        const paginatedData = filteredData.slice(startIndex, endIndex)

        // Convert to domain entities
        const results = paginatedData.map(item =>
            plainToInstance(StockOutDto, item).toDomain()
        )

        return {
            results,
            count,
        }
    }

    public async getStockOutById(id: string): Promise<StockOutEntity> {
        // Find the item in our mock data
        const stockOut = this.mockStockOuts.find(item => item.id === id)

        if (!stockOut) {
            throw new Error(`Stock out record with id ${id} not found`)
        }

        return plainToInstance(StockOutDto, stockOut).toDomain()
    }

    public async createStockOut(
        data: CreateStockOutPayload
    ): Promise<StockOutEntity> {
        // Generate a new ID and reference
        const newId = `so-${uuidv4().substring(0, 6)}`
        const newReference = `SO-${new Date().getFullYear()}-${String(
            this.mockStockOuts.length + 1
        ).padStart(3, '0')}`

        // Calculate total items
        const totalItems = data.products.reduce(
            (total, product) => total + product.quantity,
            0
        )

        // Create a new stock out record
        const newStockOut = {
            id: newId,
            reference: newReference,
            ...data,
            // Default to pending if no status provided
            status: data.status || 'pending',
            // Use current date if not provided
            date: data.date || new Date().toISOString(),
            totalItems,
        }

        // In a real app, we would persist this to the database
        // For our mock, just add it to the array
        this.mockStockOuts.push(newStockOut)

        return plainToInstance(StockOutDto, newStockOut).toDomain()
    }

    public async updateStockOutStatus(
        id: string,
        status: StockOutEntity['status']
    ): Promise<StockOutEntity> {
        // Find the item index in our mock data
        const index = this.mockStockOuts.findIndex(item => item.id === id)

        if (index === -1) {
            throw new Error(`Stock out record with id ${id} not found`)
        }

        // Update the status
        this.mockStockOuts[index].status = status

        return plainToInstance(
            StockOutDto,
            this.mockStockOuts[index]
        ).toDomain()
    }
}

export default StockOutRepository
