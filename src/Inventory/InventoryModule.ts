import { getModuleContainer, module } from 'inversiland'
import { GetInventoryStore } from './Presentation/Stores/GetInventoryStore/GetInventoryStore'
import { IInventoryRepositoryToken } from './Domain/Specifications/IInventoryRepository'
import InventoryRepository from './Infrastructure/Implementations/InventoryRepository'
import GetInventoryUseCase from './Application/UseCases/GetInventoryUseCase'

@module({
    providers: [
        {
            provide: IInventoryRepositoryToken,
            useClass: InventoryRepository,
        },
        GetInventoryUseCase,
        {
            useClass: GetInventoryStore,
            scope: 'Transient',
        },
    ],
})
export class InventoryModule {}

export const inventoryModuleContainer = getModuleContainer(InventoryModule)
