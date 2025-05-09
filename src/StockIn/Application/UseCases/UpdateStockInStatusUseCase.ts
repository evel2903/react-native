import { injectable, inject } from 'inversiland'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '../../Domain/Specifications/IStockInRepository'
import { UseCase } from 'src/Core/Application/UseCase'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import { UpdateStockInStatusPayload } from '../Types/UpdateStockInStatusPayload'

@injectable()
export default class UpdateStockInStatusUseCase
    implements UseCase<UpdateStockInStatusPayload, Promise<StockInEntity>>
{
    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {}

    public execute(
        payload: UpdateStockInStatusPayload
    ): Promise<StockInEntity> {
        return this.stockInRepository.updateStockInStatus(
            payload.id,
            payload.status
        )
    }
}
