import { injectable, inject } from 'inversiland'
import {
    IStockOutRepository,
    IStockOutRepositoryToken,
} from '../../Domain/Specifications/IStockOutRepository'
import GetStockOutsPayload from '../Types/GetStockOutsPayload'
import { UseCase } from 'src/Core/Application/UseCase'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'

@injectable()
export default class GetStockOutsUseCase
    implements
        UseCase<
            GetStockOutsPayload,
            Promise<{ results: StockOutEntity[]; count: number }>
        >
{
    constructor(
        @inject(IStockOutRepositoryToken)
        private readonly stockOutRepository: IStockOutRepository
    ) {}

    public execute(payload: GetStockOutsPayload) {
        return this.stockOutRepository.getStockOuts(payload)
    }
}
