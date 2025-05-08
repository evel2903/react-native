import { injectable, inject } from 'inversiland'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '../../Domain/Specifications/IStockInRepository'
import { UseCase } from 'src/Core/Application/UseCase'
import StockInEntity from '../../Domain/Entities/StockInEntity'

@injectable()
export default class GetStockInByIdUseCase
    implements UseCase<string, Promise<StockInEntity>>
{
    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {}

    public execute(id: string): Promise<StockInEntity> {
        return this.stockInRepository.getStockInById(id)
    }
}