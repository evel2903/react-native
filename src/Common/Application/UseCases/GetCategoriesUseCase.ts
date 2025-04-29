// src/Common/Application/UseCases/GetCategoriesUseCase.ts
import { injectable, inject } from 'inversiland';
import { UseCase } from '@/src/Core/Application/UseCase';
import { IMasterDataRepository, IMasterDataRepositoryToken } from '../../Domain/Specifications/IMasterDataRepository';
import { CategoryEntity } from '../../Domain/Entities/CategoryEntity';

@injectable()
export class GetCategoriesUseCase implements UseCase<void, Promise<CategoryEntity[]>> {
    constructor(
        @inject(IMasterDataRepositoryToken)
        private readonly masterDataRepository: IMasterDataRepository
    ) {}

    public execute(): Promise<CategoryEntity[]> {
        return this.masterDataRepository.getCategories();
    }
}