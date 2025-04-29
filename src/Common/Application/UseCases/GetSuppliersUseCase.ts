// src/Common/Application/UseCases/GetSuppliersUseCase.ts
import { injectable, inject } from 'inversiland';
import { UseCase } from '@/src/Core/Application/UseCase';
import { IMasterDataRepository, IMasterDataRepositoryToken } from '../../Domain/Specifications/IMasterDataRepository';
import { SupplierEntity } from '../../Domain/Entities/SupplierEntity';

@injectable()
export class GetSuppliersUseCase implements UseCase<void, Promise<SupplierEntity[]>> {
    constructor(
        @inject(IMasterDataRepositoryToken)
        private readonly masterDataRepository: IMasterDataRepository
    ) {}

    public execute(): Promise<SupplierEntity[]> {
        return this.masterDataRepository.getSuppliers();
    }
}