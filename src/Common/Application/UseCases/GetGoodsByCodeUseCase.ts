// src/Common/Application/UseCases/GetGoodsByCodeUseCase.ts
import { injectable, inject } from 'inversiland'
import { UseCase } from '@/src/Core/Application/UseCase'
import {
    IMasterDataRepository,
    IMasterDataRepositoryToken,
} from '../../Domain/Specifications/IMasterDataRepository'
import { GoodsEntity } from '../../Domain/Entities/GoodsEntity'

@injectable()
export class GetGoodsByCodeUseCase
    implements UseCase<string, Promise<GoodsEntity | null>>
{
    constructor(
        @inject(IMasterDataRepositoryToken)
        private readonly masterDataRepository: IMasterDataRepository
    ) {}

    public execute(code: string): Promise<GoodsEntity | null> {
        return this.masterDataRepository.getGoodsByCode(code)
    }
}
