import { injectable, inject } from 'inversiland'
import { IStockInRepository } from '../../Domain/Specifications/IStockInRepository'
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import {
    StockInListItemDto,
    StockInListResponseDto,
} from '../Models/StockInListItemDto'
import StockInDto from '../Models/StockInDto'
import { plainToInstance } from 'class-transformer'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'

@injectable()
class StockInRepository implements IStockInRepository {
    private readonly baseUrl = '/api/mobile/stock-in'

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async createStockIn(
        payload: CreateStockInPayload
    ): Promise<StockInEntity> {
        try {
            // Make API request to create stock in
            const response = await this.httpClient.post<
                CreateStockInPayload,
                any
            >(this.baseUrl, payload)

            if (!response) {
                throw new Error('Failed to create stock in record')
            }

            // Transform the response to domain entity using StockInDto
            const stockInDto = plainToInstance(StockInDto, response)
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
            const response = await this.httpClient.get<StockInListResponseDto>(
                url
            )

            // Check if the response has the expected structure
            if (!response || !response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format')
            }

            // Transform the response items to domain entities
            const stockInItems = response.data.map(item => {
                const stockInDto = plainToInstance(StockInListItemDto, item)
                return stockInDto.toDomain()
            })

            // Use the count from the response or default to items length
            const totalCount = stockInItems.length > 0 ? stockInItems.length : 0

            return {
                results: stockInItems,
                count: totalCount,
            }
        } catch (error) {
            console.error('Error fetching stock ins:', error)
            throw error instanceof Error
                ? error
                : new Error('Failed to fetch stock in records')
        }
    }

    public async getStockInById(id: string): Promise<StockInEntity> {
        try {
            const response = await this.httpClient.get<any>(
                `${this.baseUrl}/${id}`
            )

            // Check if the response has the expected structure
            if (!response) {
                throw new Error('Stock in record not found')
            }

            // Transform the response to domain entity using StockInDto
            const stockInDto = plainToInstance(StockInDto, response)
            return stockInDto.toDomain()
        } catch (error) {
            console.error(`Error fetching stock in with ID ${id}:`, error)
            throw error instanceof Error
                ? error
                : new Error(`Failed to fetch stock in record with ID ${id}`)
        }
    }

    public async updateStockInStatus(
        id: string,
        status: StockInEntity['status']
    ): Promise<StockInEntity> {
        try {
            // Make API request to update status
            const response = await this.httpClient.patch<
                { status: StockInEntity['status'] },
                any
            >(`${this.baseUrl}/${id}/status`, { status })

            // Check if the response has the expected structure
            if (!response) {
                throw new Error('Failed to update stock in status')
            }

            // Transform the response to domain entity using StockInDto
            const stockInDto = plainToInstance(StockInDto, response)
            return stockInDto.toDomain()
        } catch (error) {
            console.error(`Error updating stock in status for ID ${id}:`, error)
            throw error instanceof Error
                ? error
                : new Error(`Failed to update stock in status for ID ${id}`)
        }
    }
}

export default StockInRepository
