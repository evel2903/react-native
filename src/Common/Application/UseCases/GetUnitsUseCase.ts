// src/Common/Application/UseCases/GetUnitsUseCase.ts
import { injectable, inject } from 'inversiland';
import { UseCase } from '@/src/Core/Application/UseCase';
import { IMasterDataRepository, IMasterDataRepositoryToken } from '../../Domain/Specifications/IMasterDataRepository';
import { UnitEntity } from '../../Domain/Entities/UnitEntity';

@injectable()
export class GetUnitsUseCase implements UseCase<void, Promise<UnitEntity[]>> {
    constructor(
        @inject(IMasterDataRepositoryToken)
        private readonly masterDataRepository: IMasterDataRepository
    ) {}

    public execute(): Promise<UnitEntity[]> {
        return this.masterDataRepository.getUnits();
    }
}