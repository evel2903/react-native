// src/Tracking/Presentation/Types/TrackingStoreState.ts
import { LocationTrackingEntity } from '../../Domain/Entities/LocationTrackingEntity';
import { GoodsTrackingEntity } from '../../Domain/Entities/GoodsTrackingEntity';

export default interface TrackingStoreState {
    isLoading: boolean;
    locationTrackingData: LocationTrackingEntity[];
    goodsTrackingData: GoodsTrackingEntity[];
    error: string | null;
    activeTrackingType: 'POSITION' | 'GOODS' | null;
}