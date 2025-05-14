import { getModuleContainer, module } from 'inversiland'
import { PickingStore } from './Presentation/Stores/PickingStore/PickingStore'
import { IPickingRepositoryToken } from './Domain/Specifications/IPickingRepository'
import PickingRepository from './Infrastructure/Implementations/PickingRepository'
import GetPickingOrdersUseCase from './Application/UseCases/GetPickingOrdersUseCase'
import GetPickingOrderByIdUseCase from './Application/UseCases/GetPickingOrderByIdUseCase'
import CreateOrUpdatePickingOrderItemUseCase from './Application/UseCases/CreateOrUpdatePickingOrderItemUseCase'
import GetPickingOrderProcessUseCase from './Application/UseCases/GetPickingOrderProcessUseCase'
import UpdatePickingOrderProcessItemUseCase from './Application/UseCases/UpdatePickingOrderProcessItemUseCase'
import CompletePickingOrderProcessUseCase from './Application/UseCases/CompletePickingOrderProcessUseCase'
import SendProcessCompletedEmailUseCase from './Application/UseCases/SendProcessCompletedEmailUseCase'

@module({
    providers: [
        // Repository implementation
        {
            provide: IPickingRepositoryToken,
            useClass: PickingRepository,
        },
        // Use cases
        GetPickingOrdersUseCase,
        GetPickingOrderByIdUseCase,
        CreateOrUpdatePickingOrderItemUseCase,
        GetPickingOrderProcessUseCase,
        UpdatePickingOrderProcessItemUseCase,
        CompletePickingOrderProcessUseCase,
        SendProcessCompletedEmailUseCase,
        // Store
        {
            useClass: PickingStore,
            scope: 'Transient',
        },
    ],
})
export class PickingModule {}

export const pickingModuleContainer = getModuleContainer(PickingModule)
