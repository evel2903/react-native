import { injectable, inject } from 'inversiland'
import {
    IPickingRepository,
    IPickingRepositoryToken,
} from '../../Domain/Specifications/IPickingRepository'
import { UseCase } from '@/src/Core/Application/UseCase'

@injectable()
export default class CompletePickingOrderProcessUseCase
    implements UseCase<string, Promise<{ success: boolean; message: string }>>
{
    constructor(
        @inject(IPickingRepositoryToken)
        private readonly pickingRepository: IPickingRepository
    ) {}

    public execute(id: string): Promise<{ success: boolean; message: string }> {
        return this.pickingRepository.completePickingOrderProcess(id)
    }
}