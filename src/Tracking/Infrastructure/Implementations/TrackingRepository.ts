// src/Tracking/Infrastructure/Implementations/TrackingRepository.ts
import { injectable, inject } from 'inversiland';
import { ITrackingRepository } from '../../Domain/Specifications/ITrackingRepository';
import { LocationTrackingEntity } from '../../Domain/Entities/LocationTrackingEntity';
import { GoodsTrackingEntity } from '../../Domain/Entities/GoodsTrackingEntity';
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient';
import { plainToInstance } from 'class-transformer';
import { LocationTrackingDto } from '../Models/LocationTrackingDto';
import { GoodsTrackingDto } from '../Models/GoodsTrackingDto';

@injectable()
class TrackingRepository implements ITrackingRepository {
    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async getTrackingByLocation(
        shelfCode: string,
        level: number,
        position: number
    ): Promise<LocationTrackingEntity[]> {
        try {
            const response: any = await this.httpClient.get(
                `/api/stocks/get-stock-tracking-by-locations/${shelfCode}/${level}/${position}`
            );

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format for location tracking');
            }

            return response.data.map((item: any) =>
                plainToInstance(LocationTrackingDto, item).toDomain()
            );
        } catch (error) {
            console.error('Error fetching location tracking data:', error);
            throw error;
        }
    }

    public async getTrackingByGoods(goodsCode: string): Promise<GoodsTrackingEntity[]> {
        try {
            const response: any = await this.httpClient.get(
                `/api/stocks/get-stock-tracking-by-goods/${goodsCode}`
            );

            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Unexpected API response format for goods tracking');
            }

            return response.data.map((item: any) =>
                plainToInstance(GoodsTrackingDto, item).toDomain()
            );
        } catch (error) {
            console.error('Error fetching goods tracking data:', error);
            throw error;
        }
    }
}

export default TrackingRepository;