import { injectable, inject } from 'inversiland'
import {
    IPickingRepository,
    IPickingRepositoryToken,
} from '../../Domain/Specifications/IPickingRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import PickingOrderEntity from '../../Domain/Entities/PickingOrderEntity'

@injectable()
export default class GetPickingOrderByIdUseCase
    implements UseCase<string, Promise<PickingOrderEntity>>
{
    constructor(
        @inject(IPickingRepositoryToken)
        private readonly pickingRepository: IPickingRepository
    ) {}

    public execute(id: string): Promise<PickingOrderEntity> {
        return this.pickingRepository.getPickingOrderById(id)
    }
}
