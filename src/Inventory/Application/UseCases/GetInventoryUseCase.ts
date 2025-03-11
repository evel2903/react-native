import { injectable, inject } from 'inversiland'
import {
    IInventoryRepository,
    IInventoryRepositoryToken,
} from '../../Domain/Specifications/IInventoryRepository'
import GetInventoryPayload from '../Types/GetInventoryPayload'
import { UseCase } from '@/src/Core/Application/UseCase'
import GetInventoryResponse from '../Types/GetInventoryResponse'

@injectable()
export default class GetInventoryUseCase
    implements UseCase<GetInventoryPayload, Promise<GetInventoryResponse>>
{
    constructor(
        @inject(IInventoryRepositoryToken)
        private readonly inventoryRepository: IInventoryRepository
    ) {}

    public execute(payload: GetInventoryPayload) {
        return this.inventoryRepository.getInventory(payload)
    }
}
