// src/Tracking/Domain/Specifications/ITrackingRepository.ts
import { LocationTrackingEntity } from '../Entities/LocationTrackingEntity';
import { GoodsTrackingEntity } from '../Entities/GoodsTrackingEntity';

export const ITrackingRepositoryToken = Symbol('ITrackingRepository');

export interface ITrackingRepository {
    getTrackingByLocation(shelfCode: string, level: number, position: number): Promise<LocationTrackingEntity[]>;
    getTrackingByGoods(goodsCode: string): Promise<GoodsTrackingEntity[]>;
}