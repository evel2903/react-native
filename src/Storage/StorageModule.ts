import { getModuleContainer, module } from 'inversiland'
import { StorageStore } from './Presentation/Stores/StorageStore/StorageStore'
import { IStorageRepositoryToken } from './Domain/Specifications/IStorageRepository'
import StorageRepository from './Infrastructure/Implementations/StorageRepository'
import GetStorageVouchersUseCase from './Application/UseCases/GetStorageVouchersUseCase'
import GetStorageVoucherByIdUseCase from './Application/UseCases/GetStorageVoucherByIdUseCase'
import ProcessStorageVoucherUseCase from './Application/UseCases/ProcessStorageVoucherUseCase'
import CreateOrUpdateStorageVoucherItemUseCase from './Application/UseCases/CreateOrUpdateStorageVoucherItemUseCase'

@module({
    providers: [
        // Repository implementation
        {
            provide: IStorageRepositoryToken,
            useClass: StorageRepository,
        },
        // Use cases
        GetStorageVouchersUseCase,
        GetStorageVoucherByIdUseCase,
        ProcessStorageVoucherUseCase,
        CreateOrUpdateStorageVoucherItemUseCase,
        // Store
        {
            useClass: StorageStore,
            scope: 'Transient',
        },
    ],
})
export class StorageModule {}

export const storageModuleContainer = getModuleContainer(StorageModule)