// src/StockOut/Infrastructure/Implementations/StockOutRepository.ts
import { injectable, inject } from 'inversiland'
import { IStockOutRepository } from '../../Domain/Specifications/IStockOutRepository'
import GetStockOutsPayload from '../../Application/Types/GetStockOutsPayload'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'
import { plainToInstance } from 'class-transformer'
import { StockOutDto } from '../Models/StockOutDto'

@injectable()
class StockOutRepository implements IStockOutRepository {
    // API endpoint
    private readonly apiBaseUrl = '/api/stock-out'

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async getStockOuts(
        payload: GetStockOutsPayload
    ): Promise<{ results: StockOutEntity[]; count: number }> {
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

            if (payload.receiverId) {
                queryParams.append('receiverId', payload.receiverId)
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

            // Make API request
            const url = `${this.apiBaseUrl}?${queryParams.toString()}`
            const response: any = await this.httpClient.get(url)

            // Check if the response has the expected structure
            if (!response || !response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format')
            }

            // Transform the response items to domain entities using StockOutDto
            const stockOutItems = response.data.map((item: any) =>
                plainToInstance(StockOutDto, item).toDomain()
            )

            // Use the count from the response or default to items length
            const totalCount = response.count || stockOutItems.length

            return {
                results: stockOutItems,
                count: totalCount,
            }
        } catch (error) {
            console.error('Error fetching stock outs:', error)
            throw error instanceof Error
                ? error
                : new Error('Failed to fetch stock out records')
        }
    }

    public async getStockOutById(id: string): Promise<StockOutEntity> {
        try {
            const response: any = await this.httpClient.get(
                `${this.apiBaseUrl}/${id}`
            )

            // Check if the response has the expected structure
            if (!response) {
                throw new Error('Stock out record not found')
            }

            // API may respond with { data: { ... stockOutData } }
            const stockOutData = response.data || response

            // Transform the response to domain entity using StockOutDto
            return plainToInstance(StockOutDto, stockOutData).toDomain()
        } catch (error) {
            console.error(`Error fetching stock out with ID ${id}:`, error)
            throw error instanceof Error
                ? error
                : new Error(`Failed to fetch stock out record with ID ${id}`)
        }
    }

    public async updateStockOutStatus(
        id: string,
        status: StockOutEntity['status'],
        stateId: string
    ): Promise<StockOutEntity> {
        try {
            const response: any = await this.httpClient.patch(
                `${this.apiBaseUrl}/${id}/status`,
                { status, stateId }
            )

            // Check if the response has the expected structure
            if (!response) {
                throw new Error('Failed to update stock out status')
            }

            // Transform the response to domain entity using StockOutDto
            return plainToInstance(StockOutDto, response).toDomain()
        } catch (error) {
            console.error(
                `Error updating stock out status for ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(`Failed to update stock out status for ID ${id}`)
        }
    }

    public async deleteStockOut(id: string): Promise<boolean> {
        try {
            // Use the API endpoint for deleteStockOut
            await this.httpClient.delete(`${this.apiBaseUrl}/${id}`)

            // For 204 responses, the successful deletion is indicated by the status code itself
            // We can simply return true if we reach this point without exceptions
            return true
        } catch (error) {
            console.error(`Error deleting stock out with ID ${id}:`, error)
            throw error instanceof Error
                ? error
                : new Error(`Failed to delete stock out record with ID ${id}`)
        }
    }
}

export default StockOutRepository
