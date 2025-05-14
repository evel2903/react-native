import { injectable, inject } from 'inversiland'
import {
    IPickingRepository,
    IPickingRepositoryToken,
} from '../../Domain/Specifications/IPickingRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import { PickingOrderProcessEntity } from '../../Domain/Entities/PickingOrderProcessEntity'

@injectable()
export default class GetPickingOrderProcessUseCase
    implements UseCase<string, Promise<PickingOrderProcessEntity>>
{
    constructor(
        @inject(IPickingRepositoryToken)
        private readonly pickingRepository: IPickingRepository
    ) {}

    public execute(id: string): Promise<PickingOrderProcessEntity> {
        return this.pickingRepository.getPickingOrderProcess(id)
    }
}
