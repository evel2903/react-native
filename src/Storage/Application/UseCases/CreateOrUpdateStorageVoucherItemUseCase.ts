import { injectable, inject } from 'inversiland'
import {
    IStorageRepository,
    IStorageRepositoryToken,
} from '../../Domain/Specifications/IStorageRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import { StorageVoucherItemEntity } from '../../Domain/Entities/StorageVoucherEntity'

@injectable()
export default class CreateOrUpdateStorageVoucherItemUseCase
    implements UseCase<any, Promise<StorageVoucherItemEntity>>
{
    constructor(
        @inject(IStorageRepositoryToken)
        private readonly storageRepository: IStorageRepository
    ) {}

    public execute(data: any): Promise<StorageVoucherItemEntity> {
        return this.storageRepository.createOrUpdateStorageVoucherItem(data)
    }
}