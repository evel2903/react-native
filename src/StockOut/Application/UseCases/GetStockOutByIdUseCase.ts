// src/StockOut/Application/UseCases/GetStockOutByIdUseCase.ts
import { injectable, inject } from 'inversiland'
import { UseCase } from '@/src/Core/Application/UseCase'
import {
    IStockOutRepository,
    IStockOutRepositoryToken,
} from '../../Domain/Specifications/IStockOutRepository'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'

@injectable()
export default class GetStockOutByIdUseCase
    implements UseCase<string, Promise<StockOutEntity>>
{
    constructor(
        @inject(IStockOutRepositoryToken)
        private readonly stockOutRepository: IStockOutRepository
    ) {}

    public execute(id: string): Promise<StockOutEntity> {
        return this.stockOutRepository.getStockOutById(id)
    }
}