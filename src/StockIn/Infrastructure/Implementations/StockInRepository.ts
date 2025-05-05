import { injectable, inject } from 'inversiland'
import { IStockInRepository } from '../../Domain/Specifications/IStockInRepository'
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import StockInDto from '../Models/StockInDto'
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

    public async createStockIn(payload: any): Promise<StockInEntity> {
        try {
            // Make API request to create stock in
            const response: any = await this.httpClient.post(
                this.baseUrl,
                payload
            );
            
            if (!response) {
                throw new Error('Failed to create stock in record');
            }
            
            // Transform the response to domain entity
            return this.transformToEntity(response);
        } catch (error) {
            console.error('Error creating stock in:', error);
            throw error instanceof Error 
                ? error 
                : new Error('Failed to create stock in record');
        }
    }

    public async getStockIns(
        payload: GetStockInsPayload
    ): Promise<{ results: StockInEntity[]; count: number }> {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            
            // Pagination parameters
            if (payload.page) {
                queryParams.append('page', payload.page.toString());
            }
            
            if (payload.pageSize) {
                queryParams.append('pageSize', payload.pageSize.toString());
            }
            
            // Filter parameters
            if (payload.code) {
                queryParams.append('code', payload.code);
            }
            
            if (payload.status) {
                queryParams.append('status', payload.status);
            }
            
            if (payload.priority !== undefined) {
                queryParams.append('priority', payload.priority.toString());
            }
            
            if (payload.supplierId) {
                queryParams.append('supplierId', payload.supplierId);
            }
            
            if (payload.lotNumber) {
                queryParams.append('lotNumber', payload.lotNumber);
            }
            
            if (payload.startDate) {
                queryParams.append('startDate', payload.startDate);
            }
            
            if (payload.endDate) {
                queryParams.append('endDate', payload.endDate);
            }
            
            if (payload.search) {
                queryParams.append('search', payload.search);
            }
            
            const url = `${this.baseUrl}?${queryParams.toString()}`;
            
            // Make API request
            const response: any = await this.httpClient.get(url);
            
            // Check if the response has the expected structure
            if (!response || !response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format');
            }
            
            // Transform the data to match our domain model
            const stockInItems = response.data.map((item: any) => this.transformToEntity(item));
            
            // Use the count from the first item or default to items length
            const totalCount = response.total || (stockInItems.length > 0 ? stockInItems[0].count : stockInItems.length);
            
            return {
                results: stockInItems,
                count: totalCount,
            };
        } catch (error) {
            console.error('Error fetching stock ins:', error);
            throw error;
        }
    }

    public async getStockInById(id: string): Promise<StockInEntity> {
        try {
            const response: any = await this.httpClient.get(
                `${this.baseUrl}/${id}`
            )

            // Check if the response has the expected structure
            if (!response) {
                throw new Error('Stock in record not found')
            }

            // Transform the response to domain entity
            return this.transformToEntity(response);
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
            if (!response) {
                throw new Error('Failed to update stock in status')
            }

            // Transform the response to domain entity
            return this.transformToEntity(response);
        } catch (error) {
            console.error(`Error updating stock in status for ID ${id}:`, error)
            throw error
        }
    }

    // Helper method to transform API response to domain entity
    private transformToEntity(item: any): StockInEntity {
        return {
            id: item.Id || item.id,
            code: item.Code || item.code,
            supplierId: item.SupplierId || item.supplierId,
            inDate: item.InDate || item.inDate,
            description: item.Description || item.description || '',
            status: item.Status || item.status,
            notes: item.Notes || item.notes || '',
            lotNumber: item.LotNumber || item.lotNumber,
            totalAmount: String(item.TotalAmount || item.totalAmount || 0),
            priority: item.Priority || item.priority || 0,
            createdAt: item.CreatedAt || item.createdAt,
            updatedAt: item.UpdatedAt || item.updatedAt,
            count: item.count || 0,
            createdBy: item.CreatedBy || item.createdBy || null,
            approvedBy: item.ApprovedBy || item.approvedBy || null,
            isActive: item.IsActive || item.isActive,
            isDeleted: item.IsDeleted || item.isDeleted,
            details: Array.isArray(item.Details || item.details) 
                ? (item.Details || item.details).map((detail: any) => ({
                    id: detail.Id || detail.id,
                    goodsId: detail.GoodsId || detail.goodsId,
                    quantity: detail.Quantity || detail.quantity,
                    price: String(detail.Price || detail.price),
                    expiryDate: detail.ExpiryDate || detail.expiryDate,
                    notes: detail.Notes || detail.notes || '',
                    goods: detail.goods ? {
                        id: detail.goods.id,
                        name: detail.goods.name,
                    } : null
                }))
                : [],
            supplier: item.supplier ? {
                id: item.supplier.id,
                code: item.supplier.code,
                name: item.supplier.name,
                isActive: item.supplier.isActive !== undefined ? item.supplier.isActive : true,
                isDeleted: item.supplier.isDeleted !== undefined ? item.supplier.isDeleted : false,
            } : undefined,
        }
    }
}

export default StockInRepository