// src/Common/Application/UseCases/GetRowsUseCase.ts
import { injectable, inject } from 'inversiland'
import { UseCase } from '@/src/Core/Application/UseCase'
import {
    IMasterDataRepository,
    IMasterDataRepositoryToken,
} from '../../Domain/Specifications/IMasterDataRepository'
import { RowEntity } from '../../Domain/Entities/RowEntity'

@injectable()
export class GetRowsUseCase implements UseCase<void, Promise<RowEntity[]>> {
    constructor(
        @inject(IMasterDataRepositoryToken)
        private readonly masterDataRepository: IMasterDataRepository
    ) {}

    public execute(): Promise<RowEntity[]> {
        return this.masterDataRepository.getRows()
    }
}
