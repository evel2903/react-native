// src/Tracking/Presentation/Stores/TrackingStore/TrackingStore.ts
import { injectable, inject } from 'inversiland';
import { makeAutoObservable } from 'mobx';
import TrackingStoreState from '../../Types/TrackingStoreState';
import { LocationTrackingEntity } from '@/src/Tracking/Domain/Entities/LocationTrackingEntity';
import { GoodsTrackingEntity } from '@/src/Tracking/Domain/Entities/GoodsTrackingEntity';
import { GetLocationTrackingUseCase } from '@/src/Tracking/Application/UseCases/GetLocationTrackingUseCase';
import { GetGoodsTrackingUseCase } from '@/src/Tracking/Application/UseCases/GetGoodsTrackingUseCase';
import LocationTrackingParams from '@/src/Tracking/Application/Types/LocationTrackingParams';

@injectable()
export class TrackingStore implements TrackingStoreState {
    isLoading = false;
    locationTrackingData: LocationTrackingEntity[] = [];
    goodsTrackingData: GoodsTrackingEntity[] = [];
    error: string | null = null;
    activeTrackingType: 'POSITION' | 'GOODS' | null = null;

    constructor(
        @inject(GetLocationTrackingUseCase)
        private readonly getLocationTrackingUseCase: GetLocationTrackingUseCase,
        @inject(GetGoodsTrackingUseCase)
        private readonly getGoodsTrackingUseCase: GetGoodsTrackingUseCase
    ) {
        makeAutoObservable(this);
    }

    setIsLoading(isLoading: boolean) {
        this.isLoading = isLoading;
    }

    setError(error: string | null) {
        this.error = error;
    }

    setActiveTrackingType(type: 'POSITION' | 'GOODS' | null) {
        this.activeTrackingType = type;
    }

    clearTrackingData() {
        this.locationTrackingData = [];
        this.goodsTrackingData = [];
        this.activeTrackingType = null;
    }

    // Parse location code format to extract shelf code, level and position
    // Expected format: SHELF_CODE/LEVEL/POSITION (e.g., SH20255E00003/2/2)
    parseLocationCode(code: string): LocationTrackingParams | null {
        const parts = code.split('/');
        
        if (parts.length !== 3) {
            return null;
        }

        const shelfCode = parts[0];
        const level = parseInt(parts[1], 10);
        const position = parseInt(parts[2], 10);

        if (isNaN(level) || isNaN(position)) {
            return null;
        }

        return {
            shelfCode,
            level,
            position
        };
    }

    async trackByLocation(code: string) {
        try {
            this.setIsLoading(true);
            this.setError(null);
            this.clearTrackingData();
            
            const params = this.parseLocationCode(code);
            if (!params) {
                throw new Error('Invalid location format. Expected format: SHELF_CODE/LEVEL/POSITION');
            }

            this.locationTrackingData = await this.getLocationTrackingUseCase.execute(params);
            this.setActiveTrackingType('POSITION');
            return true;
        } catch (error) {
            this.setError(error instanceof Error ? error.message : 'Failed to track by location');
            return false;
        } finally {
            this.setIsLoading(false);
        }
    }

    async trackByGoods(goodsCode: string) {
        try {
            this.setIsLoading(true);
            this.setError(null);
            this.clearTrackingData();
            
            this.goodsTrackingData = await this.getGoodsTrackingUseCase.execute(goodsCode);
            this.setActiveTrackingType('GOODS');
            return true;
        } catch (error) {
            this.setError(error instanceof Error ? error.message : 'Failed to track by goods');
            return false;
        } finally {
            this.setIsLoading(false);
        }
    }
}