import { injectable, inject } from 'inversiland'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '../../Domain/Specifications/IStockInRepository'
import CreateStockInPayload from '../Types/CreateStockInPayload'
import { UseCase } from 'src/Core/Application/UseCase'
import StockInEntity from '../../Domain/Entities/StockInEntity'

@injectable()
export default class CreateStockInUseCase
    implements UseCase<CreateStockInPayload, Promise<StockInEntity>>
{
    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {}

    public execute(payload: CreateStockInPayload) {
        return this.stockInRepository.createStockIn(payload)
    }
}
