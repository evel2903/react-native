import { injectable, inject } from 'inversiland'
import { IStorageRepository, IStorageRepositoryToken, GetStorageVouchersPayload } from '../../Domain/Specifications/IStorageRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import StorageVoucherEntity from '../../Domain/Entities/StorageVoucherEntity'

@injectable()
export default class GetStorageVouchersUseCase
    implements
        UseCase<
            GetStorageVouchersPayload,
            Promise<{ results: StorageVoucherEntity[]; count: number }>
        >
{
    constructor(
        @inject(IStorageRepositoryToken)
        private readonly storageRepository: IStorageRepository
    ) {}

    public execute(payload: GetStorageVouchersPayload) {
        return this.storageRepository.getStorageVouchers(payload)
    }
}