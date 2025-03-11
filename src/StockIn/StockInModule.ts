import { getModuleContainer, module } from 'inversiland'
import { StockInStore } from './Presentation/Stores/StockInStore/StockInStore'
import { IStockInRepositoryToken } from './Domain/Specifications/IStockInRepository'
import StockInRepository from './Infrastructure/Implementations/StockInRepository'
import GetStockInsUseCase from './Application/UseCases/GetStockInsUseCase'
import CreateStockInUseCase from './Application/UseCases/CreateStockInUseCase'

@module({
    providers: [
        {
            provide: IStockInRepositoryToken,
            useClass: StockInRepository,
        },
        GetStockInsUseCase,
        CreateStockInUseCase,
        {
            useClass: StockInStore,
            scope: 'Transient',
        },
    ],
})
export class StockInModule {}

export const stockInModuleContainer = getModuleContainer(StockInModule)
