// src/StockOut/StockOutModule.ts
import { getModuleContainer, module } from 'inversiland'
import { StockOutStore } from './Presentation/Stores/StockOutStore/StockOutStore'
import { IStockOutRepositoryToken } from './Domain/Specifications/IStockOutRepository'
import StockOutRepository from './Infrastructure/Implementations/StockOutRepository'
import GetStockOutsUseCase from './Application/UseCases/GetStockOutsUseCase'
import GetStockOutByIdUseCase from './Application/UseCases/GetStockOutByIdUseCase'

@module({
    providers: [
        {
            provide: IStockOutRepositoryToken,
            useClass: StockOutRepository,
        },
        GetStockOutsUseCase,
        GetStockOutByIdUseCase,
        {
            useClass: StockOutStore,
            scope: 'Transient',
        },
    ],
})
export class StockOutModule {}

export const stockOutModuleContainer = getModuleContainer(StockOutModule)