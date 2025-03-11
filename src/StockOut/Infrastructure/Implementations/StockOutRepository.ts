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
            productId: 'prod-001',
            productName: 'Laptop',
            quantity: 2,
            unit: 'pc',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            issuedBy: 'John Doe',
            issuedTo: 'IT Department',
            reason: 'Equipment upgrade',
            notes: 'Delivered to 3rd floor',
            status: 'completed',
        },
        {
            id: 'so-002',
            productId: 'prod-002',
            productName: 'Smartphone',
            quantity: 5,
            unit: 'pc',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            issuedBy: 'Jane Smith',
            issuedTo: 'Sales Team',
            reason: 'New employee onboarding',
            status: 'completed',
        },
        {
            id: 'so-003',
            productId: 'prod-003',
            productName: 'Headphones',
            quantity: 3,
            unit: 'pc',
            date: new Date().toISOString(), // Today
            issuedBy: 'John Doe',
            issuedTo: 'Marketing Department',
            reason: 'Work from home equipment',
            status: 'pending',
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
                    item.productName.toLowerCase().includes(searchLower) ||
                    item.issuedTo.toLowerCase().includes(searchLower) ||
                    item.reason?.toLowerCase().includes(searchLower) ||
                    item.notes?.toLowerCase().includes(searchLower)
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
        // Generate a new ID
        const newId = `so-${uuidv4().substring(0, 6)}`

        // Create a new stock out record
        const newStockOut = {
            id: newId,
            ...data,
            // Default to pending if no status provided
            status: data.status || 'pending',
            // Use current date if not provided
            date: data.date || new Date().toISOString(),
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
