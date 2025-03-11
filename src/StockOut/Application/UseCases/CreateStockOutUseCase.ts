import { injectable, inject } from 'inversiland'
import {
    IStockOutRepository,
    IStockOutRepositoryToken,
} from '../../Domain/Specifications/IStockOutRepository'
import CreateStockOutPayload from '../Types/CreateStockOutPayload'
import { UseCase } from 'src/Core/Application/UseCase'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'

@injectable()
export default class CreateStockOutUseCase
    implements UseCase<CreateStockOutPayload, Promise<StockOutEntity>>
{
    constructor(
        @inject(IStockOutRepositoryToken)
        private readonly stockOutRepository: IStockOutRepository
    ) {}

    public execute(payload: CreateStockOutPayload) {
        return this.stockOutRepository.createStockOut(payload)
    }
}
