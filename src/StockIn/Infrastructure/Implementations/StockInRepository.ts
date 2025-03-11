import { injectable, inject } from 'inversiland'
import { IStockInRepository } from '../../Domain/Specifications/IStockInRepository'
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import StockInDto from '../Models/StockInDto'
import { plainToInstance } from 'class-transformer'
import IHttpClient, {
    IHttpClientToken,
} from 'src/Core/Domain/Specifications/IHttpClient'
import { v4 as uuidv4 } from 'uuid'

@injectable()
class StockInRepository implements IStockInRepository {
    private readonly baseUrl = '/api/stock-in'

    // Mock data for demo
    private mockStockIns: any[] = [
        {
            id: 'si-001',
            productId: 'prod-001',
            productName: 'Laptop',
            quantity: 10,
            unit: 'pc',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            receivedBy: 'John Doe',
            supplierName: 'Tech Supplies Inc.',
            supplierInvoice: 'INV-12345',
            notes: 'Delivery was on time',
            status: 'completed',
        },
        {
            id: 'si-002',
            productId: 'prod-002',
            productName: 'Smartphone',
            quantity: 25,
            unit: 'pc',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            receivedBy: 'Jane Smith',
            supplierName: 'Mobile Gadgets Ltd.',
            supplierInvoice: 'INV-67890',
            notes: 'Some items had minor packaging damage',
            status: 'completed',
        },
        {
            id: 'si-003',
            productId: 'prod-003',
            productName: 'Headphones',
            quantity: 15,
            unit: 'pc',
            date: new Date().toISOString(), // Today
            receivedBy: 'John Doe',
            supplierName: 'Audio Equipment Co.',
            supplierInvoice: 'INV-24680',
            status: 'pending',
        },
    ]

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async getStockIns(
        payload: GetStockInsPayload
    ): Promise<{ results: StockInEntity[]; count: number }> {
        // In a real app, this would be an API call
        // For demo, we'll filter the mock data

        let filteredData = [...this.mockStockIns]

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
                    item.supplierName?.toLowerCase().includes(searchLower) ||
                    item.supplierInvoice?.toLowerCase().includes(searchLower) ||
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
            plainToInstance(StockInDto, item).toDomain()
        )

        return {
            results,
            count,
        }
    }

    public async getStockInById(id: string): Promise<StockInEntity> {
        // Find the item in our mock data
        const stockIn = this.mockStockIns.find(item => item.id === id)

        if (!stockIn) {
            throw new Error(`Stock in record with id ${id} not found`)
        }

        return plainToInstance(StockInDto, stockIn).toDomain()
    }

    public async createStockIn(
        data: CreateStockInPayload
    ): Promise<StockInEntity> {
        // Generate a new ID
        const newId = `si-${uuidv4().substring(0, 6)}`

        // Create a new stock in record
        const newStockIn = {
            id: newId,
            ...data,
            // Default to pending if no status provided
            status: data.status || 'pending',
            // Use current date if not provided
            date: data.date || new Date().toISOString(),
        }

        // In a real app, we would persist this to the database
        // For our mock, just add it to the array
        this.mockStockIns.push(newStockIn)

        return plainToInstance(StockInDto, newStockIn).toDomain()
    }

    public async updateStockInStatus(
        id: string,
        status: StockInEntity['status']
    ): Promise<StockInEntity> {
        // Find the item index in our mock data
        const index = this.mockStockIns.findIndex(item => item.id === id)

        if (index === -1) {
            throw new Error(`Stock in record with id ${id} not found`)
        }

        // Update the status
        this.mockStockIns[index].status = status

        return plainToInstance(StockInDto, this.mockStockIns[index]).toDomain()
    }
}

export default StockInRepository
