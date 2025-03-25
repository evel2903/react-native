import { injectable, inject } from 'inversiland'
import { IInventoryRepository } from '../../Domain/Specifications/IInventoryRepository'
import GetInventoryPayload from '../../Application/Types/GetInventoryPayload'
import GetInventoryResponse from '../../Application/Types/GetInventoryResponse'
import InventoryRecordDto from '../Models/InventoryRecordDto'
import { plainToInstance } from 'class-transformer'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'
import InventoryRecordEntity from '../../Domain/Entities/InventoryRecordEntity'

@injectable()
class InventoryRepository implements IInventoryRepository {
    private readonly baseUrl = '/api/inventory'
    private cachedMockRecords: any[] | null = null

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async getInventory(
        payload: GetInventoryPayload
    ): Promise<GetInventoryResponse> {
        try {
            // Generate some mock inventory records
            const mockRecords = this.generateMockInventoryRecords()

            // Apply filters (status, date range, search)
            let filteredData = [...mockRecords]

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

            // Apply location filter
            if (payload.location) {
                filteredData = filteredData.filter(
                    item => item.location === payload.location
                )
            }

            // Apply search filter
            if (payload.search) {
                const searchLower = payload.search.toLowerCase()
                filteredData = filteredData.filter(
                    item =>
                        item.reference.toLowerCase().includes(searchLower) ||
                        item.conductedBy.toLowerCase().includes(searchLower) ||
                        item.location?.toLowerCase().includes(searchLower) ||
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

            // Transform to domain entities
            const results = paginatedData.map(item =>
                plainToInstance(InventoryRecordDto, item).toDomain()
            )

            return {
                results,
                count,
            }
        } catch (error) {
            console.error('Error in getInventory:', error)
            return {
                results: [],
                count: 0,
            }
        }
    }

    public async getInventoryRecordById(
        id: string
    ): Promise<InventoryRecordEntity> {
        try {
            // In a real app, you would make an API call to fetch the inventory record
            // For demo purposes, we'll find it in our mock data
            const mockRecords = this.generateMockInventoryRecords()
            const record = mockRecords.find(record => record.id === id)

            if (!record) {
                throw new Error(`Inventory record with id ${id} not found`)
            }

            return plainToInstance(InventoryRecordDto, record).toDomain()
        } catch (error) {
            console.error('Error in getInventoryRecordById:', error)
            throw error
        }
    }

    public async updateInventoryRecordStatus(
        id: string,
        status: InventoryRecordEntity['status']
    ): Promise<InventoryRecordEntity> {
        try {
            // Find the item index in our mock data
            const mockRecords = this.generateMockInventoryRecords()
            const index = mockRecords.findIndex(item => item.id === id)

            if (index === -1) {
                throw new Error(`Inventory record with id ${id} not found`)
            }

            // Update the status
            mockRecords[index].status = status

            // Update the cached data
            if (this.cachedMockRecords) {
                const cacheIndex = this.cachedMockRecords.findIndex(
                    item => item.id === id
                )
                if (cacheIndex !== -1) {
                    this.cachedMockRecords[cacheIndex].status = status
                }
            }

            return plainToInstance(
                InventoryRecordDto,
                mockRecords[index]
            ).toDomain()
        } catch (error) {
            console.error('Error in updateInventoryRecordStatus:', error)
            throw error
        }
    }

    // Helper method to generate mock inventory records
    private generateMockInventoryRecords(): any[] {
        // Use cached data if available
        if (this.cachedMockRecords) {
            return this.cachedMockRecords
        }

        // Generate mock data and cache it
        this.cachedMockRecords = [
            {
                id: 'inv-001',
                reference: 'INV-2025-001',
                date: new Date(
                    Date.now() - 5 * 24 * 60 * 60 * 1000
                ).toISOString(), // 5 days ago
                conductedBy: 'John Doe',
                location: 'Warehouse A',
                status: 'pending',
                notes: 'Regular monthly inventory check',
                products: [
                    {
                        productId: 'prod-001',
                        productName: 'Laptop Dell XPS 13',
                        expectedQuantity: 25,
                        actualQuantity: 23,
                        unit: 'pc',
                        discrepancy: -2,
                        lastUpdated: new Date().toISOString(),
                        notes: 'Two units missing, investigating',
                    },
                    {
                        productId: 'prod-002',
                        productName: 'Smartphone Samsung Galaxy S23',
                        expectedQuantity: 50,
                        actualQuantity: 48,
                        unit: 'pc',
                        discrepancy: -2,
                        lastUpdated: new Date().toISOString(),
                        notes: 'Two display units removed for demo',
                    },
                    {
                        productId: 'prod-003',
                        productName: 'Wireless Headphones',
                        expectedQuantity: 30,
                        actualQuantity: 32,
                        unit: 'pc',
                        discrepancy: 2,
                        lastUpdated: new Date().toISOString(),
                        notes: 'Extra units found, updating system',
                    },
                ],
                totalItems: 103,
            },
            {
                id: 'inv-002',
                reference: 'INV-2025-002',
                date: new Date(
                    Date.now() - 2 * 24 * 60 * 60 * 1000
                ).toISOString(), // 2 days ago
                conductedBy: 'Jane Smith',
                location: 'Warehouse B',
                status: 'in-progress',
                products: [
                    {
                        productId: 'prod-004',
                        productName: 'Office Chair',
                        expectedQuantity: 15,
                        actualQuantity: 15,
                        unit: 'pc',
                        discrepancy: 0,
                        lastUpdated: new Date().toISOString(),
                    },
                    {
                        productId: 'prod-005',
                        productName: 'Desk',
                        expectedQuantity: 10,
                        actualQuantity: 8,
                        unit: 'pc',
                        discrepancy: -2,
                        lastUpdated: new Date().toISOString(),
                        notes: 'Two units in assembly area',
                    },
                    {
                        productId: 'prod-006',
                        productName: 'Monitor',
                        expectedQuantity: 20,
                        actualQuantity: 18,
                        unit: 'pc',
                        discrepancy: -2,
                        lastUpdated: new Date().toISOString(),
                    },
                ],
                totalItems: 41,
            },
            {
                id: 'inv-003',
                reference: 'INV-2025-003',
                date: new Date(
                    Date.now() - 10 * 24 * 60 * 60 * 1000
                ).toISOString(), // 10 days ago
                conductedBy: 'Robert Johnson',
                location: 'Warehouse A',
                status: 'completed',
                notes: 'Quarterly inventory audit',
                products: [
                    {
                        productId: 'prod-007',
                        productName: 'Printer',
                        expectedQuantity: 8,
                        actualQuantity: 8,
                        unit: 'pc',
                        discrepancy: 0,
                        lastUpdated: new Date().toISOString(),
                    },
                    {
                        productId: 'prod-008',
                        productName: 'Scanner',
                        expectedQuantity: 5,
                        actualQuantity: 5,
                        unit: 'pc',
                        discrepancy: 0,
                        lastUpdated: new Date().toISOString(),
                    },
                ],
                totalItems: 13,
            },
            {
                id: 'inv-004',
                reference: 'INV-2025-004',
                date: new Date(
                    Date.now() - 15 * 24 * 60 * 60 * 1000
                ).toISOString(), // 15 days ago
                conductedBy: 'Michael Williams',
                location: 'Warehouse C',
                status: 'cancelled',
                notes: 'Cancelled due to staff shortage',
                products: [],
                totalItems: 0,
            },
        ]

        return this.cachedMockRecords
    }
}

export default InventoryRepository
