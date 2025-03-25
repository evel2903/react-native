import { injectable, inject } from 'inversiland'
import {
    IInventoryRepository,
    IInventoryRepositoryToken,
} from '../../Domain/Specifications/IInventoryRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import InventoryRecordEntity from '../../Domain/Entities/InventoryRecordEntity'

@injectable()
export default class GetInventoryRecordUseCase
    implements UseCase<string, Promise<InventoryRecordEntity>>
{
    constructor(
        @inject(IInventoryRepositoryToken)
        private readonly inventoryRepository: IInventoryRepository
    ) {}

    public execute(id: string) {
        return this.inventoryRepository.getInventoryRecordById(id)
    }
}
