import { injectable, inject } from 'inversiland'
import {
    IInventoryRepository,
    IInventoryRepositoryToken,
} from '../../Domain/Specifications/IInventoryRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import InventoryRecordEntity from '../../Domain/Entities/InventoryRecordEntity'

@injectable()
export default class UpdateInventoryStatusUseCase
    implements
        UseCase<
            { id: string; status: InventoryRecordEntity['status'] },
            Promise<InventoryRecordEntity>
        >
{
    constructor(
        @inject(IInventoryRepositoryToken)
        private readonly inventoryRepository: IInventoryRepository
    ) {}

    public execute({
        id,
        status,
    }: {
        id: string
        status: InventoryRecordEntity['status']
    }) {
        return this.inventoryRepository.updateInventoryRecordStatus(id, status)
    }
}
