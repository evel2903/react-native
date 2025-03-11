import { injectable, inject } from 'inversiland'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '../../Domain/Specifications/IStockInRepository'
import GetStockInsPayload from '../Types/GetStockInsPayload'
import { UseCase } from 'src/Core/Application/UseCase'
import StockInEntity from '../../Domain/Entities/StockInEntity'

@injectable()
export default class GetStockInsUseCase
    implements
        UseCase<
            GetStockInsPayload,
            Promise<{ results: StockInEntity[]; count: number }>
        >
{
    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {}

    public execute(payload: GetStockInsPayload) {
        return this.stockInRepository.getStockIns(payload)
    }
}
