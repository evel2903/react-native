// src/Tracking/TrackingModule.ts
import { getModuleContainer, module } from 'inversiland'
import { ITrackingRepositoryToken } from './Domain/Specifications/ITrackingRepository'
import TrackingRepository from './Infrastructure/Implementations/TrackingRepository'
import { GetLocationTrackingUseCase } from './Application/UseCases/GetLocationTrackingUseCase'
import { GetGoodsTrackingUseCase } from './Application/UseCases/GetGoodsTrackingUseCase'
import { TrackingStore } from './Presentation/Stores/TrackingStore/TrackingStore'

@module({
    providers: [
        {
            provide: ITrackingRepositoryToken,
            useClass: TrackingRepository,
        },
        GetLocationTrackingUseCase,
        GetGoodsTrackingUseCase,
        {
            useClass: TrackingStore,
            scope: 'Transient',
        },
    ],
})
export class TrackingModule {}

export const trackingModuleContainer = getModuleContainer(TrackingModule)
