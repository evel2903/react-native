import { getModuleContainer, module } from 'inversiland'
import { StockInStore } from './Presentation/Stores/StockInStore/StockInStore'
import { IStockInRepositoryToken } from './Domain/Specifications/IStockInRepository'
import StockInRepository from './Infrastructure/Implementations/StockInRepository'
import GetStockInsUseCase from './Application/UseCases/GetStockInsUseCase'
import CreateStockInUseCase from './Application/UseCases/CreateStockInUseCase'
import { GetCurrentApprovalStageUseCase } from './Application/UseCases/GetCurrentApprovalStageUseCase'
import { CreateApprovalRequestUseCase } from './Application/UseCases/CreateApprovalRequestUseCase'
import { CreateApprovalDecisionUseCase } from './Application/UseCases/CreateApprovalDecisionUseCase'
import GetStockInByIdUseCase from './Application/UseCases/GetStockInByIdUseCase'
import UpdateStockInStatusUseCase from './Application/UseCases/UpdateStockInStatusUseCase'
import DeleteStockInUseCase from './Application/UseCases/DeleteStockInUseCase'
import UpdateStockInUseCase from './Application/UseCases/UpdateStockInUseCase'

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
        CreateApprovalDecisionUseCase,
        GetStockInByIdUseCase,
        UpdateStockInStatusUseCase,
        DeleteStockInUseCase,
        UpdateStockInUseCase,
        {
            useClass: StockInStore,
            scope: 'Transient',
        },
    ],
})
export class StockInModule {}

export const stockInModuleContainer = getModuleContainer(StockInModule)
