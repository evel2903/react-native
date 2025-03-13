// src/Inventory/InventoryModule.ts
import { getModuleContainer, module } from 'inversiland'
import { InventoryStore } from './Presentation/Stores/InventoryStore/InventoryStore'
import { IInventoryRepositoryToken } from './Domain/Specifications/IInventoryRepository'
import InventoryRepository from './Infrastructure/Implementations/InventoryRepository'
import GetInventoryUseCase from './Application/UseCases/GetInventoryUseCase'
import GetInventoryRecordUseCase from './Application/UseCases/GetInventoryRecordUseCase'
import UpdateInventoryStatusUseCase from './Application/UseCases/UpdateInventoryStatusUseCase'

@module({
    providers: [
        {
            provide: IInventoryRepositoryToken,
            useClass: InventoryRepository,
        },
        GetInventoryUseCase,
        GetInventoryRecordUseCase,
        UpdateInventoryStatusUseCase,
        {
            useClass: InventoryStore,
            scope: 'Singleton', // Changed from 'Transient' to 'Singleton'
        },
    ],
})
export class InventoryModule {}

export const inventoryModuleContainer = getModuleContainer(InventoryModule)