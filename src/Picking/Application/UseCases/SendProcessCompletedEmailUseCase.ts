import { injectable, inject } from 'inversiland'
import { UseCase } from '@/src/Core/Application/UseCase'
import {
    IPickingRepository,
    IPickingRepositoryToken,
} from '../../Domain/Specifications/IPickingRepository'

@injectable()
export default class SendProcessCompletedEmailUseCase
    implements
        UseCase<string, Promise<{ statusCode: number; message: string }>>
{
    constructor(
        @inject(IPickingRepositoryToken)
        private readonly pickingRepository: IPickingRepository
    ) {}

    public execute(
        id: string
    ): Promise<{ statusCode: number; message: string }> {
        return this.pickingRepository.sendProcessCompletedEmail(id)
    }
}
