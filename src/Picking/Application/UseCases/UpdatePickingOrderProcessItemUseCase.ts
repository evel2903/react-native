import { injectable, inject } from 'inversiland'
import {
    IPickingRepository,
    IPickingRepositoryToken,
} from '../../Domain/Specifications/IPickingRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import { PickingOrderProcessItemEntity } from '../../Domain/Entities/PickingOrderProcessEntity'

@injectable()
export default class UpdatePickingOrderProcessItemUseCase
    implements UseCase<{ id: string; quantityPicked: number }, Promise<PickingOrderProcessItemEntity>>
{
    constructor(
        @inject(IPickingRepositoryToken)
        private readonly pickingRepository: IPickingRepository
    ) {}

    public execute(data: { id: string; quantityPicked: number }): Promise<PickingOrderProcessItemEntity> {
        return this.pickingRepository.updatePickingOrderProcessItem(
            data.id, 
            { quantityPicked: data.quantityPicked }
        )
    }
}