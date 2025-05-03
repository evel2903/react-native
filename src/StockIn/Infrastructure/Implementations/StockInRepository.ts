import { injectable, inject } from 'inversiland';
import { IStockInRepository } from '../../Domain/Specifications/IStockInRepository';
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload';
import StockInEntity from '../../Domain/Entities/StockInEntity';
import StockInDto from '../Models/StockInDto';
import { plainToInstance } from 'class-transformer';
import IHttpClient, { IHttpClientToken } from '@/src/Core/Domain/Specifications/IHttpClient';

@injectable()
class StockInRepository implements IStockInRepository {
    private readonly baseUrl = '/api/stock-in';

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async getStockIns(
        payload: GetStockInsPayload
    ): Promise<{ results: StockInEntity[]; count: number }> {
        try {
            // Build query parameters
            const queryParams = new URLSearchParams();
            
            if (payload.page) {
                queryParams.append('page', payload.page.toString());
            }
            
            if (payload.pageSize) {
                queryParams.append('pageSize', payload.pageSize.toString());
            }
            
            if (payload.status) {
                queryParams.append('status', payload.status);
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
                    createdBy: null,
                    approvedBy: null,
                    details: [], // Will be populated when getting individual stock in details
                    supplier: {
                        id: item.supplierId,
                        code: item.supplierCode,
                        name: item.supplierName,
                        isActive: !item.isDeleted,
                        isDeleted: item.isDeleted
                    }
                } as StockInEntity;
            });
            
            return {
                results: stockInItems,
                count: response.total || stockInItems.length,
            };
        } catch (error) {
            console.error('Error fetching stock ins:', error);
            throw error;
        }
    }

    public async getStockInById(id: string): Promise<StockInEntity> {
        try {
            const response: any = await this.httpClient.get(`${this.baseUrl}/${id}`);
            
            // Check if the response has the expected structure
            if (!response || !response.data) {
                throw new Error('Stock in record not found');
            }
            
            const item = response.data;
            
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
                createdBy: item.createdBy || null,
                approvedBy: item.approvedBy || null,
                details: item.details || [], // Assuming details are included in the single item response
                supplier: {
                    id: item.supplierId,
                    code: item.supplierCode,
                    name: item.supplierName,
                    isActive: !item.isDeleted,
                    isDeleted: item.isDeleted
                }
            } as StockInEntity;
        } catch (error) {
            console.error(`Error fetching stock in with ID ${id}:`, error);
            throw error;
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
            );
            
            // Check if the response has the expected structure
            if (!response || !response.data) {
                throw new Error('Failed to update stock in status');
            }
            
            const item = response.data;
            
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
                createdBy: item.createdBy || null,
                approvedBy: item.approvedBy || null,
                details: item.details || [], // Assuming details are included in the response
                supplier: {
                    id: item.supplierId,
                    code: item.supplierCode,
                    name: item.supplierName,
                    isActive: !item.isDeleted,
                    isDeleted: item.isDeleted
                }
            } as StockInEntity;
        } catch (error) {
            console.error(`Error updating stock in status for ID ${id}:`, error);
            throw error;
        }
    }
}

export default StockInRepository;