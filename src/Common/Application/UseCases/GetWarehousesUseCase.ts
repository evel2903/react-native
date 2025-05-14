// src/Common/Application/UseCases/GetWarehousesUseCase.ts
import { injectable, inject } from 'inversiland'
import { UseCase } from '@/src/Core/Application/UseCase'
import {
    IMasterDataRepository,
    IMasterDataRepositoryToken,
} from '../../Domain/Specifications/IMasterDataRepository'
import { WarehouseEntity } from '../../Domain/Entities/WarehouseEntity'

@injectable()
export class GetWarehousesUseCase
    implements UseCase<void, Promise<WarehouseEntity[]>>
{
    constructor(
        @inject(IMasterDataRepositoryToken)
        private readonly masterDataRepository: IMasterDataRepository
    ) {}

    public execute(): Promise<WarehouseEntity[]> {
        return this.masterDataRepository.getWarehouses()
    }
}
