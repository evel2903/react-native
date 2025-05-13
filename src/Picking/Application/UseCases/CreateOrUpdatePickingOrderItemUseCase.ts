import { injectable, inject } from 'inversiland'
import {
    IPickingRepository,
    IPickingRepositoryToken,
} from '../../Domain/Specifications/IPickingRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import { PickingOrderItemEntity } from '../../Domain/Entities/PickingOrderEntity'

@injectable()
export default class CreateOrUpdatePickingOrderItemUseCase
    implements UseCase<any, Promise<PickingOrderItemEntity>>
{
    constructor(
        @inject(IPickingRepositoryToken)
        private readonly pickingRepository: IPickingRepository
    ) {}

    public execute(data: any): Promise<PickingOrderItemEntity> {
        return this.pickingRepository.createOrUpdatePickingOrderItem(data)
    }
}