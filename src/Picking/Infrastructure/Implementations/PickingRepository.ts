import { injectable, inject } from 'inversiland'
import {
    IPickingRepository,
    GetPickingOrdersPayload,
} from '../../Domain/Specifications/IPickingRepository'
import PickingOrderEntity, { PickingOrderItemEntity } from '../../Domain/Entities/PickingOrderEntity'
import { plainToInstance } from 'class-transformer'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'
import {
    PickingOrderListItemDto,
    PickingOrderListResponseDto,
} from '../Models/PickingOrderListItemDto'
import PickingOrderDto from '../Models/PickingOrderDto'

@injectable()
class PickingRepository implements IPickingRepository {
    // Base API URLs
    private readonly apiBaseUrl = '/api/picking-orders'
    private readonly apiBaseMobileUrl = '/api/mobile/picking-orders'

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) { }

    public async getPickingOrders(
        payload: GetPickingOrdersPayload
    ): Promise<{ results: PickingOrderEntity[]; count: number }> {
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
                queryParams.append('priorityList', payload.priority.toString())
            }

            if (payload.assignedTo) {
                queryParams.append('assignedTo', payload.assignedTo)
            }

            if (payload.pickingDateStart) {
                queryParams.append('pickingDateStart', payload.pickingDateStart)
            }

            if (payload.pickingDateEnd) {
                queryParams.append('pickingDateEnd', payload.pickingDateEnd)
            }

            if (payload.search) {
                queryParams.append('search', payload.search)
            }

            // Make API request
            const url = `${this.apiBaseMobileUrl}?${queryParams.toString()}`
            const response =
                await this.httpClient.get<PickingOrderListResponseDto>(url)

            // Check if the response has the expected structure
            if (!response || !response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format')
            }

            // Transform the response items to domain entities
            const pickingOrders = response.data.map(item => {
                const dto = plainToInstance(PickingOrderListItemDto, item)
                return dto.toDomain()
            })

            // Use the count from the response or default to items length
            const totalCount = pickingOrders.length

            return {
                results: pickingOrders,
                count: totalCount,
            }
        } catch (error) {
            console.error('Error fetching picking orders:', error)
            throw error instanceof Error
                ? error
                : new Error('Failed to fetch picking order records')
        }
    }

    public async getPickingOrderById(
        id: string
    ): Promise<PickingOrderEntity> {
        try {
            const response = await this.httpClient.get<any>(
                `${this.apiBaseUrl}/${id}`
            )

            // Check if the response has the expected structure
            if (!response) {
                throw new Error('Picking order not found')
            }

            // The API might return { data: { ... orderData } }
            const data = response.data || response

            // Transform the response to domain entity
            const pickingOrderDto = plainToInstance(PickingOrderDto, data)
            return pickingOrderDto.toDomain()
        } catch (error) {
            console.error(
                `Error fetching picking order with ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(`Failed to fetch picking order with ID ${id}`)
        }
    }

    public async updatePickingOrderStatus(
        id: string,
        status: PickingOrderEntity['status']
    ): Promise<PickingOrderEntity> {
        try {
            const response = await this.httpClient.patch<
                { status: PickingOrderEntity['status'] },
                any
            >(`${this.apiBaseUrl}/${id}/status`, { status })

            if (!response) {
                throw new Error('Failed to update picking order status')
            }

            // Transform the response to domain entity
            const pickingOrderDto = plainToInstance(
                PickingOrderDto,
                response
            )
            return pickingOrderDto.toDomain()
        } catch (error) {
            console.error(
                `Error updating picking order status for ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(
                    `Failed to update picking order status for ID ${id}`
                )
        }
    }

    public async createPickingOrder(
        data: any
    ): Promise<PickingOrderEntity> {
        try {
            const response = await this.httpClient.post<any, any>(
                this.apiBaseUrl,
                data
            )

            if (!response) {
                throw new Error('Failed to create picking order')
            }

            // Transform the response to domain entity
            const pickingOrderDto = plainToInstance(
                PickingOrderDto,
                response
            )
            return pickingOrderDto.toDomain()
        } catch (error) {
            console.error('Error creating picking order:', error)
            throw error instanceof Error
                ? error
                : new Error('Failed to create picking order')
        }
    }

    public async updatePickingOrder(
        id: string,
        data: any
    ): Promise<PickingOrderEntity> {
        try {
            const response = await this.httpClient.patch<any, any>(
                `${this.apiBaseUrl}/${id}`,
                data
            )

            if (!response) {
                throw new Error('Failed to update picking order')
            }

            // Transform the response to domain entity
            const pickingOrderDto = plainToInstance(
                PickingOrderDto,
                response
            )
            return pickingOrderDto.toDomain()
        } catch (error) {
            console.error(
                `Error updating picking order with ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(`Failed to update picking order with ID ${id}`)
        }
    }

    // Method to process a picking order
    public async processPickingOrder(
        id: string
    ): Promise<PickingOrderEntity> {
        try {
            const response = await this.httpClient.post<any, any>(
                `${this.apiBaseUrl}/${id}/process`,
                {}
            )

            if (!response) {
                throw new Error('Failed to process picking order')
            }

            // Transform the response to domain entity
            const pickingOrderDto = plainToInstance(
                PickingOrderDto,
                response
            )
            return pickingOrderDto.toDomain()
        } catch (error) {
            console.error(
                `Error processing picking order with ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(`Failed to process picking order with ID ${id}`)
        }
    }
    
    // Method to create or update a picking order item
    public async createOrUpdatePickingOrderItem(
        data: any
    ): Promise<PickingOrderItemEntity> {
        try {
            const response = await this.httpClient.post<any, any>(
                `${this.apiBaseUrl}/create-or-update-item`,
                data
            )

            if (!response || !response.data) {
                throw new Error('Failed to create or update picking order item')
            }

            // Map the API response to our domain entity
            const item: PickingOrderItemEntity = {
                id: response.data.Id,
                updatedAt: response.data.UpdatedAt,
                createdAt: response.data.CreatedAt,
                isDeleted: response.data.IsDeleted || false,
                pickingOrderDetailId: response.data.PickingOrderDetailId,
                stockId: response.data.StockId || data.stockId || '',
                shelfId: data.shelfId,
                rowId: data.rowId,
                areaId: data.areaId,
                warehouseId: data.warehouseId,
                shelfName: data.shelfName,
                rowName: data.rowName,
                areaName: data.areaName,
                warehouseName: data.warehouseName,
                quantity: response.data.Quantity,
                level: response.data.Level,
                position: response.data.Position,
                status: response.data.Status,
            }

            return item
        } catch (error) {
            console.error('Error creating/updating picking order item:', error)
            throw error instanceof Error
                ? error
                : new Error('Failed to create/update picking order item')
        }
    }
    
    // Method to send email notification when processing is completed
    public async sendProcessCompletedEmail(
        id: string
    ): Promise<{ statusCode: number; message: string }> {
        try {
            const response = await this.httpClient.get<any>(
                `${this.apiBaseUrl}/send-email-process-completed/${id}`
            )

            if (!response || !response.data) {
                throw new Error('Failed to send process completed email')
            }

            return {
                statusCode: response.data.statusCode || 200,
                message: response.data.message || 'Email sent successfully'
            }
        } catch (error) {
            console.error(
                `Error sending process completed email for ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(`Failed to send process completed email for ID ${id}`)
        }
    }
}

export default PickingRepository