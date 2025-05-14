import { injectable, inject } from 'inversiland'
import {
    IStorageRepository,
    IStorageRepositoryToken,
} from '../../Domain/Specifications/IStorageRepository'
import { UseCase } from '@/src/Core/Application/UseCase'

@injectable()
export default class SendProcessCompletedEmailUseCase
    implements
        UseCase<string, Promise<{ statusCode: number; message: string }>>
{
    constructor(
        @inject(IStorageRepositoryToken)
        private readonly storageRepository: IStorageRepository
    ) {}

    public execute(
        id: string
    ): Promise<{ statusCode: number; message: string }> {
        return this.storageRepository.sendProcessCompletedEmail(id)
    }
}
