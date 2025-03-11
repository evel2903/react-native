import { getModuleContainer, module } from 'inversiland'
import { StockOutStore } from './Presentation/Stores/StockOutStore/StockOutStore'
import { IStockOutRepositoryToken } from './Domain/Specifications/IStockOutRepository'
import StockOutRepository from './Infrastructure/Implementations/StockOutRepository'
import GetStockOutsUseCase from './Application/UseCases/GetStockOutsUseCase'
import CreateStockOutUseCase from './Application/UseCases/CreateStockOutUseCase'

@module({
    providers: [
        {
            provide: IStockOutRepositoryToken,
            useClass: StockOutRepository,
        },
        GetStockOutsUseCase,
        CreateStockOutUseCase,
        {
            useClass: StockOutStore,
            scope: 'Transient',
        },
    ],
})
export class StockOutModule {}

export const stockOutModuleContainer = getModuleContainer(StockOutModule)
