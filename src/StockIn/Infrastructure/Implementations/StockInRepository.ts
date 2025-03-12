import { injectable, inject } from 'inversiland'
import { IStockInRepository } from '../../Domain/Specifications/IStockInRepository'
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import StockInDto from '../Models/StockInDto'
import { plainToInstance } from 'class-transformer'
import IHttpClient, {
    IHttpClientToken,
} from 'src/Core/Domain/Specifications/IHttpClient'

@injectable()
class StockInRepository implements IStockInRepository {
    private readonly baseUrl = '/api/stock-in'

    // Mock data with the new structure for demo
    private mockStockIns: any[] = [
        {
            id: 'si-001',
            reference: 'SI-2025-001',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            receivedBy: 'John Doe',
            supplierName: 'Tech Supplies Inc.',
            supplierInvoice: 'INV-12345',
            notes: 'Delivery was on time',
            status: 'pending',
            products: [
                {
                    productId: 'prod-001',
                    productName: 'Laptop Dell XPS 13',
                    quantity: 5,
                    unit: 'pc',
                    price: 1200,
                },
                {
                    productId: 'prod-002',
                    productName: 'Laptop HP Spectre',
                    quantity: 3,
                    unit: 'pc',
                    price: 1100,
                },
                {
                    productId: 'prod-007',
                    productName: 'External SSD 1TB',
                    quantity: 10,
                    unit: 'pc',
                    price: 120,
                },
            ],
            totalItems: 18,
        },
        {
            id: 'si-002',
            reference: 'SI-2025-002',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            receivedBy: 'Jane Smith',
            supplierName: 'Mobile Gadgets Ltd.',
            supplierInvoice: 'INV-67890',
            notes: 'Some items had minor packaging damage',
            status: 'pending',
            products: [
                {
                    productId: 'prod-003',
                    productName: 'iPhone 15 Pro',
                    quantity: 10,
                    unit: 'pc',
                    price: 999,
                },
                {
                    productId: 'prod-004',
                    productName: 'Samsung Galaxy S23',
                    quantity: 15,
                    unit: 'pc',
                    price: 899,
                },
            ],
            totalItems: 25,
        },
        {
            id: 'si-003',
            reference: 'SI-2025-003',
            date: new Date().toISOString(), // Today
            receivedBy: 'Robert Johnson',
            supplierName: 'Audio Equipment Co.',
            supplierInvoice: 'INV-24680',
            status: 'processing',
            products: [
                {
                    productId: 'prod-005',
                    productName: 'Sony WH-1000XM5 Headphones',
                    quantity: 8,
                    unit: 'pc',
                    price: 349,
                },
                {
                    productId: 'prod-006',
                    productName: 'Bose QuietComfort Earbuds',
                    quantity: 12,
                    unit: 'pc',
                    price: 279,
                },
            ],
            totalItems: 20,
        },
        {
            id: 'si-004',
            reference: 'SI-2025-004',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
            receivedBy: 'Michael Williams',
            supplierName: 'Office Supplies Co.',
            supplierInvoice: 'INV-98765',
            status: 'completed',
            products: [
                {
                    productId: 'prod-008',
                    productName: 'Ergonomic Office Chair',
                    quantity: 5,
                    unit: 'pc',
                    price: 299,
                },
                {
                    productId: 'prod-009',
                    productName: 'Adjustable Standing Desk',
                    quantity: 3,
                    unit: 'pc',
                    price: 499,
                },
                {
                    productId: 'prod-010',
                    productName: 'Monitor Arms',
                    quantity: 6,
                    unit: 'pc',
                    price: 129,
                },
            ],
            totalItems: 14,
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
                    item.reference.toLowerCase().includes(searchLower) ||
                    item.supplierName?.toLowerCase().includes(searchLower) ||
                    item.supplierInvoice?.toLowerCase().includes(searchLower) ||
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
