import { injectable, inject } from 'inversiland'
import { 
    IStockInRepository
} from '../../Domain/Specifications/IStockInRepository'
import { ApprovalStage } from '../../Domain/Entities/ApprovalStage'
import { ApprovalRequest } from '../../Domain/Entities/ApprovalRequest'
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
    // Mobile API endpoint - used for getStockIns only
    private readonly mobileBaseUrl = '/api/mobile/stock-in'
    
    // Regular API endpoint - used for all other operations
    private readonly apiBaseUrl = '/api/stock-in'

    // Approval API endpoints
    private readonly approvalStageUrl = '/api/approval-stage'
    private readonly approvalRequestUrl = '/api/approval-request'

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async createStockIn(
        payload: CreateStockInPayload
    ): Promise<StockInEntity> {
        try {
            // Make API request to create stock in using the regular API endpoint
            const response = await this.httpClient.post<
                CreateStockInPayload,
                any
            >(this.apiBaseUrl, payload)

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

            // Use the mobile API endpoint for getStockIns
            const url = `${this.mobileBaseUrl}?${queryParams.toString()}`

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
            // Use the regular API endpoint for getStockInById
            const response = await this.httpClient.get<any>(
                `${this.apiBaseUrl}/${id}`
            )

            // Check if the response has the expected structure
            if (!response) {
                throw new Error('Stock in record not found')
            }

            // API responds with { data: { ... stockInData } }
            // Extract the actual stock data from the nested data property
            if (!response.data) {
                throw new Error('Stock in record data is missing')
            }

            // Transform the response to domain entity using StockInDto
            const stockInDto = plainToInstance(StockInDto, response.data)
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
            // Use the regular API endpoint for updateStockInStatus
            const response = await this.httpClient.patch<
                { status: StockInEntity['status'] },
                any
            >(`${this.apiBaseUrl}/${id}/status`, { status })

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

    public async deleteStockIn(id: string): Promise<boolean> {
        try {
            // Use the regular API endpoint for deleteStockIn
            const response = await this.httpClient.delete<any>(
                `${this.apiBaseUrl}/${id}`
            )
    
            // For 204 responses, the successful deletion is indicated by the status code itself
            // The response might be null, undefined, or an empty object
            // We can simply return true if we reach this point without exceptions
            return true
        } catch (error) {
            console.error(`Error deleting stock in with ID ${id}:`, error)
            throw error instanceof Error
                ? error
                : new Error(`Failed to delete stock in record with ID ${id}`)
        }
    }

    public async updateStockIn(id: string, payload: any): Promise<StockInEntity> {
        try {
            // Use the regular API endpoint for updating stock in
            const response = await this.httpClient.patch<any, any>(
                `${this.apiBaseUrl}/${id}`,
                payload
            )

            // Check if the response has the expected structure
            if (!response) {
                throw new Error('Failed to update stock in')
            }

            // Transform the response to domain entity using StockInDto
            const stockInDto = plainToInstance(StockInDto, response)
            return stockInDto.toDomain()
        } catch (error) {
            console.error(`Error updating stock in with ID ${id}:`, error)
            throw error instanceof Error
                ? error
                : new Error(`Failed to update stock in with ID ${id}`)
        }
    }

    // New method for getting the current approval stage
    public async getCurrentApprovalStage(
        resourceName: string, 
        stockStatus: string
    ): Promise<ApprovalStage> {
        try {
            const url = `${this.approvalStageUrl}/get-current-stage?resourceName=${resourceName}&stockStatus=${stockStatus}`;
            
            const response = await this.httpClient.get<{ data: ApprovalStage }>(url);
            
            if (!response || !response.data) {
                throw new Error('Failed to get current approval stage');
            }
            
            return response.data;
        } catch (error) {
            console.error('Error fetching current approval stage:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to get current approval stage');
        }
    }
    
    // New method for creating an approval request
    public async createApprovalRequest(
        objectId: string,
        currentStageId: string,
        objectType: string,
        requesterId: string
    ): Promise<ApprovalRequest> {
        try {
            const payload = {
                objectId,
                currentStageId,
                objectType,
                requesterId
            };
            
            const response = await this.httpClient.post<
                typeof payload,
                { data: ApprovalRequest }
            >(this.approvalRequestUrl, payload);
            
            if (!response || !response.data) {
                throw new Error('Failed to create approval request');
            }
            
            return response.data;
        } catch (error) {
            console.error('Error creating approval request:', error);
            throw error instanceof Error
                ? error
                : new Error('Failed to create approval request');
        }
    }
}

export default StockInRepository