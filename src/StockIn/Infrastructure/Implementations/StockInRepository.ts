import { injectable, inject } from 'inversiland';
import { IStockInRepository } from '../../Domain/Specifications/IStockInRepository';
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload';
import StockInEntity from '../../Domain/Entities/StockInEntity';
import StockInDto from '../Models/StockInDto';
import { plainToInstance } from 'class-transformer';
import IHttpClient, { IHttpClientToken } from 'src/Core/Domain/Specifications/IHttpClient';

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
                // Convert status to uppercase to match API format
                queryParams.append('status', payload.status.toUpperCase());
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
            
            // Check if the response contains a data array
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format');
            }
            
            // Transform response data to domain entities
            const stockIns = response.data.map((item: any) =>
                plainToInstance(StockInDto, item).toDomain()
            );
            
            return {
                results: stockIns,
                count: response.total || stockIns.length,
            };
        } catch (error) {
            console.error('Error fetching stock ins:', error);
            throw error;
        }
    }

    public async getStockInById(id: string): Promise<StockInEntity> {
        try {
            const response: any = await this.httpClient.get(`${this.baseUrl}/${id}`);
            
            // Check if the response contains the expected data
            if (!response.data) {
                throw new Error('Stock in record not found');
            }
            
            // Transform the single item to domain entity
            return plainToInstance(StockInDto, response.data).toDomain();
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
            
            // Transform the updated item to domain entity
            return plainToInstance(StockInDto, response.data).toDomain();
        } catch (error) {
            console.error(`Error updating stock in status for ID ${id}:`, error);
            throw error;
        }
    }
    
    // Add additional methods as required, such as createStockIn, etc.
}

export default StockInRepository;