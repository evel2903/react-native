// src/Common/Application/UseCases/GetGoodsUseCase.ts
import { injectable, inject } from 'inversiland'
import { UseCase } from '@/src/Core/Application/UseCase'
import {
    IMasterDataRepository,
    IMasterDataRepositoryToken,
} from '../../Domain/Specifications/IMasterDataRepository'
import { GoodsEntity } from '../../Domain/Entities/GoodsEntity'

@injectable()
export class GetGoodsUseCase implements UseCase<void, Promise<GoodsEntity[]>> {
    constructor(
        @inject(IMasterDataRepositoryToken)
        private readonly masterDataRepository: IMasterDataRepository
    ) {}

    public execute(): Promise<GoodsEntity[]> {
        return this.masterDataRepository.getGoods()
    }
}
