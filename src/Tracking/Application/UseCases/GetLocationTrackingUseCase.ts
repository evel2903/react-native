// src/Tracking/Application/UseCases/GetLocationTrackingUseCase.ts
import { injectable, inject } from 'inversiland'
import { UseCase } from '@/src/Core/Application/UseCase'
import {
    ITrackingRepository,
    ITrackingRepositoryToken,
} from '../../Domain/Specifications/ITrackingRepository'
import { LocationTrackingEntity } from '../../Domain/Entities/LocationTrackingEntity'
import LocationTrackingParams from '../Types/LocationTrackingParams'

@injectable()
export class GetLocationTrackingUseCase
    implements
        UseCase<LocationTrackingParams, Promise<LocationTrackingEntity[]>>
{
    constructor(
        @inject(ITrackingRepositoryToken)
        private readonly trackingRepository: ITrackingRepository
    ) {}

    public execute(
        params: LocationTrackingParams
    ): Promise<LocationTrackingEntity[]> {
        return this.trackingRepository.getTrackingByLocation(
            params.shelfCode,
            params.level,
            params.position
        )
    }
}
