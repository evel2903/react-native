import { getModuleContainer, module } from 'inversiland'
import { StockInStore } from './Presentation/Stores/StockInStore/StockInStore'
import { IStockInRepositoryToken } from './Domain/Specifications/IStockInRepository'
import StockInRepository from './Infrastructure/Implementations/StockInRepository'
import GetStockInsUseCase from './Application/UseCases/GetStockInsUseCase'
import CreateStockInUseCase from './Application/UseCases/CreateStockInUseCase'
import { GetCurrentApprovalStageUseCase } from './Application/UseCases/GetCurrentApprovalStageUseCase'
import { CreateApprovalRequestUseCase } from './Application/UseCases/CreateApprovalRequestUseCase'

@module({
    providers: [
        {
            provide: IStockInRepositoryToken,
            useClass: StockInRepository,
        },
        GetStockInsUseCase,
        CreateStockInUseCase,
        GetCurrentApprovalStageUseCase,
        CreateApprovalRequestUseCase,
        {
            useClass: StockInStore,
            scope: 'Transient',
        },
    ],
})
export class StockInModule {}

export const stockInModuleContainer = getModuleContainer(StockInModule)