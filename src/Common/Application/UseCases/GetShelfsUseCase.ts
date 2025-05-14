// src/Common/Application/UseCases/GetShelfsUseCase.ts
import { injectable, inject } from 'inversiland'
import { UseCase } from '@/src/Core/Application/UseCase'
import {
    IMasterDataRepository,
    IMasterDataRepositoryToken,
} from '../../Domain/Specifications/IMasterDataRepository'
import { ShelfEntity } from '../../Domain/Entities/ShelfEntity'

@injectable()
export class GetShelfsUseCase implements UseCase<void, Promise<ShelfEntity[]>> {
    constructor(
        @inject(IMasterDataRepositoryToken)
        private readonly masterDataRepository: IMasterDataRepository
    ) {}

    public execute(): Promise<ShelfEntity[]> {
        return this.masterDataRepository.getShelfs()
    }
}
