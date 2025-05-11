// src/Common/Application/UseCases/GetAreasUseCase.ts
import { injectable, inject } from 'inversiland'
import { UseCase } from '@/src/Core/Application/UseCase'
import {
    IMasterDataRepository,
    IMasterDataRepositoryToken,
} from '../../Domain/Specifications/IMasterDataRepository'
import { AreaEntity } from '../../Domain/Entities/AreaEntity'

@injectable()
export class GetAreasUseCase
    implements UseCase<void, Promise<AreaEntity[]>>
{
    constructor(
        @inject(IMasterDataRepositoryToken)
        private readonly masterDataRepository: IMasterDataRepository
    ) {}

    public execute(): Promise<AreaEntity[]> {
        return this.masterDataRepository.getAreas()
    }
}