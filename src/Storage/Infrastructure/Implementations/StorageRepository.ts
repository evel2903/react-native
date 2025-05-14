import { injectable, inject } from 'inversiland'
import {
    IStorageRepository,
    GetStorageVouchersPayload,
} from '../../Domain/Specifications/IStorageRepository'
import StorageVoucherEntity, {
    StorageVoucherItemEntity,
} from '../../Domain/Entities/StorageVoucherEntity'
import { plainToInstance } from 'class-transformer'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'
import {
    StorageVoucherListItemDto,
    StorageVoucherListResponseDto,
} from '../Models/StorageVoucherListItemDto'
import StorageVoucherDto from '../Models/StorageVoucherDto'

@injectable()
class StorageRepository implements IStorageRepository {
    // Base API URLs
    private readonly apiBaseUrl = '/api/storage-vouchers'
    private readonly apiBaseMobileUrl = '/api/mobile/storage-vouchers'

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async getStorageVouchers(
        payload: GetStorageVouchersPayload
    ): Promise<{ results: StorageVoucherEntity[]; count: number }> {
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

            if (payload.storageDateStart) {
                queryParams.append('storageDateStart', payload.storageDateStart)
            }

            if (payload.storageDateEnd) {
                queryParams.append('storageDateEnd', payload.storageDateEnd)
            }

            if (payload.search) {
                queryParams.append('search', payload.search)
            }

            // Make API request
            const url = `${this.apiBaseMobileUrl}?${queryParams.toString()}`
            const response =
                await this.httpClient.get<StorageVoucherListResponseDto>(url)

            // Check if the response has the expected structure
            if (!response || !response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format')
            }

            // Transform the response items to domain entities
            const storageVouchers = response.data.map(item => {
                const dto = plainToInstance(StorageVoucherListItemDto, item)
                return dto.toDomain()
            })

            // Use the count from the response or default to items length
            const totalCount = storageVouchers.length

            return {
                results: storageVouchers,
                count: totalCount,
            }
        } catch (error) {
            console.error('Error fetching storage vouchers:', error)
            throw error instanceof Error
                ? error
                : new Error('Failed to fetch storage voucher records')
        }
    }

    public async getStorageVoucherById(
        id: string
    ): Promise<StorageVoucherEntity> {
        try {
            const response = await this.httpClient.get<any>(
                `${this.apiBaseMobileUrl}/${id}`
            )

            // Check if the response has the expected structure
            if (!response) {
                throw new Error('Storage voucher not found')
            }

            // The API might return { data: { ... voucherData } }
            const data = response.data || response

            // Transform the response to domain entity
            const storageVoucherDto = plainToInstance(StorageVoucherDto, data)
            return storageVoucherDto.toDomain()
        } catch (error) {
            console.error(
                `Error fetching storage voucher with ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(`Failed to fetch storage voucher with ID ${id}`)
        }
    }

    public async updateStorageVoucherStatus(
        id: string,
        status: StorageVoucherEntity['status']
    ): Promise<StorageVoucherEntity> {
        try {
            const response = await this.httpClient.patch<
                { status: StorageVoucherEntity['status'] },
                any
            >(`${this.apiBaseUrl}/${id}/status`, { status })

            if (!response) {
                throw new Error('Failed to update storage voucher status')
            }

            // Transform the response to domain entity
            const storageVoucherDto = plainToInstance(
                StorageVoucherDto,
                response
            )
            return storageVoucherDto.toDomain()
        } catch (error) {
            console.error(
                `Error updating storage voucher status for ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(
                      `Failed to update storage voucher status for ID ${id}`
                  )
        }
    }

    public async createStorageVoucher(
        data: any
    ): Promise<StorageVoucherEntity> {
        try {
            const response = await this.httpClient.post<any, any>(
                this.apiBaseUrl,
                data
            )

            if (!response) {
                throw new Error('Failed to create storage voucher')
            }

            // Transform the response to domain entity
            const storageVoucherDto = plainToInstance(
                StorageVoucherDto,
                response
            )
            return storageVoucherDto.toDomain()
        } catch (error) {
            console.error('Error creating storage voucher:', error)
            throw error instanceof Error
                ? error
                : new Error('Failed to create storage voucher')
        }
    }

    public async updateStorageVoucher(
        id: string,
        data: any
    ): Promise<StorageVoucherEntity> {
        try {
            const response = await this.httpClient.patch<any, any>(
                `${this.apiBaseUrl}/${id}`,
                data
            )

            if (!response) {
                throw new Error('Failed to update storage voucher')
            }

            // Transform the response to domain entity
            const storageVoucherDto = plainToInstance(
                StorageVoucherDto,
                response
            )
            return storageVoucherDto.toDomain()
        } catch (error) {
            console.error(
                `Error updating storage voucher with ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(`Failed to update storage voucher with ID ${id}`)
        }
    }

    // Method to process a storage voucher (this might need to be adjusted based on actual API)
    public async processStorageVoucher(
        id: string
    ): Promise<StorageVoucherEntity> {
        try {
            const response = await this.httpClient.post<any, any>(
                `${this.apiBaseUrl}/${id}/process`,
                {}
            )

            if (!response) {
                throw new Error('Failed to process storage voucher')
            }

            // Transform the response to domain entity
            const storageVoucherDto = plainToInstance(
                StorageVoucherDto,
                response
            )
            return storageVoucherDto.toDomain()
        } catch (error) {
            console.error(
                `Error processing storage voucher with ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(`Failed to process storage voucher with ID ${id}`)
        }
    }
    // Method to create or update a storage voucher item
    public async createOrUpdateStorageVoucherItem(
        data: any
    ): Promise<StorageVoucherItemEntity> {
        try {
            const response = await this.httpClient.post<any, any>(
                `${this.apiBaseUrl}/create-or-update-item`,
                data
            )

            if (!response || !response.data) {
                throw new Error(
                    'Failed to create or update storage voucher item'
                )
            }

            // Map the API response to our domain entity
            const item: StorageVoucherItemEntity = {
                id: response.data.Id,
                updatedAt: response.data.UpdatedAt,
                createdAt: response.data.CreatedAt,
                isDeleted: response.data.IsDeleted || false,
                storageVoucherDetailId: response.data.StorageVoucherDetailId,
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
            console.error(
                'Error creating/updating storage voucher item:',
                error
            )
            throw error instanceof Error
                ? error
                : new Error('Failed to create/update storage voucher item')
        }
    }
    // Method to send email notification when processing is completed
    public async sendProcessCompletedEmail(
        id: string
    ): Promise<{ statusCode: number; message: string }> {
        try {
            const response = await this.httpClient.get<any>(
                `${this.apiBaseMobileUrl}/send-email-process-completed/${id}`
            )

            if (!response || !response.data) {
                throw new Error('Failed to send process completed email')
            }

            return {
                statusCode: response.data.statusCode || 200,
                message: response.data.message || 'Email sent successfully',
            }
        } catch (error) {
            console.error(
                `Error sending process completed email for ID ${id}:`,
                error
            )
            throw error instanceof Error
                ? error
                : new Error(
                      `Failed to send process completed email for ID ${id}`
                  )
        }
    }
}

export default StorageRepository
