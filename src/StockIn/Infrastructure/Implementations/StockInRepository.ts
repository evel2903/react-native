import { injectable, inject } from 'inversiland'
import { IStockInRepository } from '../../Domain/Specifications/IStockInRepository'
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import StockInDto from '../Models/StockInDto'
import CreateStockInDto from '../Models/CreateStockInDto'
import { plainToInstance } from 'class-transformer'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'

@injectable()
class StockInRepository implements IStockInRepository {
    private readonly baseUrl = '/api/stock-in'

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async createStockIn(
        payload: CreateStockInPayload
    ): Promise<StockInEntity> {
        try {
            // Transform the payload to DTO
            const createStockInDto = new CreateStockInDto(payload)

            // Make API request to create stock in
            const response: any = await this.httpClient.post(
                this.baseUrl,
                createStockInDto.toPlain()
            )

            // Check if the response has the expected structure
            if (!response || !response.data) {
                throw new Error('Failed to create stock in record')
            }

            // Transform the response to domain entity
            const stockInDto = plainToInstance(StockInDto, response.data)
            return stockInDto.toDomain()
        } catch (error) {
            console.error('Error creating stock in:', error)
            throw error instanceof Error
                ? error
                : new Error('Failed to create stock in record')
        }
    }

    public async getStockIns(
        payload: GetStockInsPayload
    ): Promise<{ results: StockInEntity[]; count: number }> {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams()

            // Pagination parameters
            if (payload.page) {
                queryParams.append('page', payload.page.toString())
            }

            if (payload.pageSize) {
                queryParams.append('pageSize', payload.pageSize.toString())
            }

            // Filter parameters
            if (payload.code) {
                queryParams.append('code', payload.code)
            }

            if (payload.status) {
                queryParams.append('status', payload.status)
            }

            if (payload.priority !== undefined) {
                queryParams.append('priority', payload.priority.toString())
            }

            if (payload.supplierId) {
                queryParams.append('supplierId', payload.supplierId)
            }

            if (payload.lotNumber) {
                queryParams.append('lotNumber', payload.lotNumber)
            }

            if (payload.startDate) {
                queryParams.append('startDate', payload.startDate)
            }

            if (payload.endDate) {
                queryParams.append('endDate', payload.endDate)
            }

            if (payload.search) {
                queryParams.append('search', payload.search)
            }

            const url = `${this.baseUrl}?${queryParams.toString()}`

            // Make API request
            const response: any = await this.httpClient.get(url)

            // Check if the response has the expected structure
            if (!response || !response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format')
            }

            // Transform the data to match our domain model
            const stockInItems = response.data.map((item: any) => {
                return {
                    id: item.id,
                    code: item.code,
                    supplierId: item.supplierId,
                    inDate: item.inDate,
                    description: item.description || '',
                    status: item.status,
                    notes: item.notes || '',
                    lotNumber: item.lotNumber,
                    totalAmount: item.totalAmount,
                    priority: item.priority || 0,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                    count: item.count || 0,
                    createdBy: null,
                    approvedBy: null,
                    details: [], // Will be populated when getting individual stock in details
                    supplier: {
                        id: item.supplierId,
                        code: item.supplierCode,
                        name: item.supplierName,
                        isActive: !item.isDeleted,
                        isDeleted: item.isDeleted,
                    },
                } as StockInEntity
            })

            // Use the count from the first item or default to items length
            const totalCount =
                response.total ||
                (stockInItems.length > 0
                    ? stockInItems[0].count
                    : stockInItems.length)

            return {
                results: stockInItems,
                count: totalCount,
            }
        } catch (error) {
            console.error('Error fetching stock ins:', error)
            throw error
        }
    }

    public async getStockInById(id: string): Promise<StockInEntity> {
        try {
            const response: any = await this.httpClient.get(
                `${this.baseUrl}/${id}`
            )

            // Check if the response has the expected structure
            if (!response || !response.data) {
                throw new Error('Stock in record not found')
            }

            const item = response.data

            // Transform the item to match our domain model
            return {
                id: item.id,
                code: item.code,
                supplierId: item.supplierId,
                inDate: item.inDate,
                description: item.description || '',
                status: item.status,
                notes: item.notes || '',
                lotNumber: item.lotNumber,
                totalAmount: item.totalAmount,
                priority: item.priority || 0,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                count: item.count || 0,
                createdBy: item.createdBy || null,
                approvedBy: item.approvedBy || null,
                details: item.details || [], // Assuming details are included in the single item response
                supplier: {
                    id: item.supplierId,
                    code: item.supplierCode,
                    name: item.supplierName,
                    isActive: !item.isDeleted,
                    isDeleted: item.isDeleted,
                },
            } as StockInEntity
        } catch (error) {
            console.error(`Error fetching stock in with ID ${id}:`, error)
            throw error
        }
    }

    public async updateStockInStatus(
        id: string,
        status: StockInEntity['status']
    ): Promise<StockInEntity> {
        try {
            // Make API request to update status
            const response: any = await this.httpClient.patch(
                `${this.baseUrl}/${id}/status`,
                { status }
            )

            // Check if the response has the expected structure
            if (!response || !response.data) {
                throw new Error('Failed to update stock in status')
            }

            const item = response.data

            // Transform the updated item to match our domain model
            return {
                id: item.id,
                code: item.code,
                supplierId: item.supplierId,
                inDate: item.inDate,
                description: item.description || '',
                status: item.status,
                notes: item.notes || '',
                lotNumber: item.lotNumber,
                totalAmount: item.totalAmount,
                priority: item.priority || 0,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                count: item.count || 0,
                createdBy: item.createdBy || null,
                approvedBy: item.approvedBy || null,
                details: item.details || [], // Assuming details are included in the response
                supplier: {
                    id: item.supplierId,
                    code: item.supplierCode,
                    name: item.supplierName,
                    isActive: !item.isDeleted,
                    isDeleted: item.isDeleted,
                },
            } as StockInEntity
        } catch (error) {
            console.error(`Error updating stock in status for ID ${id}:`, error)
            throw error
        }
    }
}

export default StockInRepository
