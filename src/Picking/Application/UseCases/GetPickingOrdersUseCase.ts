import { injectable, inject } from 'inversiland'
import {
    IPickingRepository,
    IPickingRepositoryToken,
    GetPickingOrdersPayload,
} from '../../Domain/Specifications/IPickingRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import PickingOrderEntity from '../../Domain/Entities/PickingOrderEntity'

@injectable()
export default class GetPickingOrdersUseCase
    implements
        UseCase<
            GetPickingOrdersPayload,
            Promise<{ results: PickingOrderEntity[]; count: number }>
        >
{
    constructor(
        @inject(IPickingRepositoryToken)
        private readonly pickingRepository: IPickingRepository
    ) {}

    public execute(payload: GetPickingOrdersPayload) {
        return this.pickingRepository.getPickingOrders(payload)
    }
}