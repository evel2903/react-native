import { injectable, inject } from 'inversiland'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '../../Domain/Specifications/IStockInRepository'
import { UseCase } from 'src/Core/Application/UseCase'
import StockInEntity from '../../Domain/Entities/StockInEntity'

interface UpdateStockInPayload {
    id: string;
    data: any;
}

@injectable()
export default class UpdateStockInUseCase
    implements UseCase<UpdateStockInPayload, Promise<StockInEntity>>
{
    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {}

    public execute(payload: UpdateStockInPayload): Promise<StockInEntity> {
        return this.stockInRepository.updateStockIn(
            payload.id,
            payload.data
        )
    }
}