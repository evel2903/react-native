import { injectable, inject } from 'inversiland'
import { IInventoryRepository } from '../../Domain/Specifications/IInventoryRepository'
import GetInventoryPayload from '../../Application/Types/GetInventoryPayload'
import GetInventoryResponse from '../../Application/Types/GetInventoryResponse'
import InventoryItemDto from '../Models/InventoryItemDto'
import { plainToInstance } from 'class-transformer'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'
import InventoryItemEntity from '../../Domain/Entities/InventoryItemEntity'

@injectable()
class InventoryRepository implements IInventoryRepository {
    private readonly baseUrl = '/api/inventory'

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async getInventory(
        payload: GetInventoryPayload
    ): Promise<GetInventoryResponse> {
        // For demo purposes, we'll simulate a response
        // In a real app, you would make an API call to fetch the data

        // Generate some mock inventory data
        const mockItems = this.generateMockItems()

        // Apply pagination
        const startIndex = (payload.page - 1) * payload.pageSize
        const endIndex = startIndex + payload.pageSize
        const paginatedItems = mockItems.slice(startIndex, endIndex)

        // Transform to domain entities
        const results = paginatedItems.map(item =>
            plainToInstance(InventoryItemDto, item).toDomain()
        )

        return {
            results,
            count: mockItems.length,
        }
    }

    public async getItemById(id: string): Promise<InventoryItemEntity> {
        // In a real app, you would make an API call to fetch the item
        // For demo purposes, we'll find it in our mock data
        const mockItems = this.generateMockItems()
        const item = mockItems.find(item => item.id === id)

        if (!item) {
            throw new Error(`Inventory item with id ${id} not found`)
        }

        return plainToInstance(InventoryItemDto, item).toDomain()
    }

    // Helper method to generate mock inventory data
    private generateMockItems(): any[] {
        return [
            {
                id: 'inv-001',
                productId: 'prod-001',
                name: 'Laptop',
                sku: 'LPT-001',
                category: 'Electronics',
                quantity: 25,
                unit: 'pc',
                reorderLevel: 5,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'inv-002',
                productId: 'prod-002',
                name: 'Smartphone',
                sku: 'SPH-001',
                category: 'Electronics',
                quantity: 50,
                unit: 'pc',
                reorderLevel: 10,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'inv-003',
                productId: 'prod-003',
                name: 'Headphones',
                sku: 'AUD-001',
                category: 'Electronics',
                quantity: 30,
                unit: 'pc',
                reorderLevel: 5,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'inv-004',
                productId: 'prod-004',
                name: 'Office Chair',
                sku: 'FRN-001',
                category: 'Furniture',
                quantity: 15,
                unit: 'pc',
                reorderLevel: 3,
                lastUpdated: new Date().toISOString(),
            },
            {
                id: 'inv-005',
                productId: 'prod-005',
                name: 'Desk',
                sku: 'FRN-002',
                category: 'Furniture',
                quantity: 10,
                unit: 'pc',
                reorderLevel: 2,
                lastUpdated: new Date().toISOString(),
            },
        ]
    }
}

export default InventoryRepository
