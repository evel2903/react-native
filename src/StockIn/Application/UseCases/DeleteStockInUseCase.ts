import { injectable, inject } from 'inversiland'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '../../Domain/Specifications/IStockInRepository'
import { UseCase } from 'src/Core/Application/UseCase'

@injectable()
export default class DeleteStockInUseCase
    implements UseCase<string, Promise<boolean>>
{
    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {}

    public execute(id: string): Promise<boolean> {
        if (!this.stockInRepository.deleteStockIn) {
            throw new Error('Delete functionality not available')
        }

        return this.stockInRepository.deleteStockIn(id)
    }
}
