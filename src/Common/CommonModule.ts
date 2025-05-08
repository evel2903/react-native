// src/Common/CommonModule.ts
import { getModuleContainer, module } from 'inversiland'
import { MasterDataStore } from './Presentation/Stores/MasterDataStore/MasterDataStore'
import { IMasterDataRepositoryToken } from './Domain/Specifications/IMasterDataRepository'
import MasterDataRepository from './Infrastructure/Implementations/MasterDataRepository'
import { GetCategoriesUseCase } from './Application/UseCases/GetCategoriesUseCase'
import { GetUnitsUseCase } from './Application/UseCases/GetUnitsUseCase'
import { GetSuppliersUseCase } from './Application/UseCases/GetSuppliersUseCase'
import { GetGoodsUseCase } from './Application/UseCases/GetGoodsUseCase'
import { GetGoodsByCodeUseCase } from './Application/UseCases/GetGoodsByCodeUseCase'

@module({
    providers: [
        {
            provide: IMasterDataRepositoryToken,
            useClass: MasterDataRepository,
        },
        GetCategoriesUseCase,
        GetUnitsUseCase,
        GetSuppliersUseCase,
        GetGoodsUseCase,
        GetGoodsByCodeUseCase,
        {
            useClass: MasterDataStore,
            scope: 'Singleton',
        },
    ],
})
export class CommonModule {}

export const commonModuleContainer = getModuleContainer(CommonModule)