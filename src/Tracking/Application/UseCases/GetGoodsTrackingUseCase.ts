// src/Tracking/Application/UseCases/GetGoodsTrackingUseCase.ts
import { injectable, inject } from 'inversiland'
import { UseCase } from '@/src/Core/Application/UseCase'
import {
    ITrackingRepository,
    ITrackingRepositoryToken,
} from '../../Domain/Specifications/ITrackingRepository'
import { GoodsTrackingEntity } from '../../Domain/Entities/GoodsTrackingEntity'

@injectable()
export class GetGoodsTrackingUseCase
    implements UseCase<string, Promise<GoodsTrackingEntity[]>>
{
    constructor(
        @inject(ITrackingRepositoryToken)
        private readonly trackingRepository: ITrackingRepository
    ) {}

    public execute(goodsCode: string): Promise<GoodsTrackingEntity[]> {
        return this.trackingRepository.getTrackingByGoods(goodsCode)
    }
}
