import { injectable, inject } from 'inversiland'
import { IStorageRepository, IStorageRepositoryToken } from '../../Domain/Specifications/IStorageRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import StorageVoucherEntity from '../../Domain/Entities/StorageVoucherEntity'

@injectable()
export default class ProcessStorageVoucherUseCase
    implements UseCase<string, Promise<StorageVoucherEntity>>
{
    constructor(
        @inject(IStorageRepositoryToken)
        private readonly storageRepository: IStorageRepository
    ) {}

    public execute(id: string): Promise<StorageVoucherEntity> {
        return new Promise((resolve, reject) => {}) // this.storageRepository.processStorageVoucher(id)
    }
}