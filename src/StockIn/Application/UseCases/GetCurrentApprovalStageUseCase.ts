import { injectable, inject } from 'inversiland'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '../../Domain/Specifications/IStockInRepository'
import { ApprovalStage } from '../../Domain/Entities/ApprovalStage'
import { UseCase } from '@/src/Core/Application/UseCase'
import { GetCurrentApprovalStagePayload } from '../Types/GetCurrentApprovalStagePayload'

@injectable()
export class GetCurrentApprovalStageUseCase
    implements UseCase<GetCurrentApprovalStagePayload, Promise<ApprovalStage>>
{
    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {}

    public execute(
        payload: GetCurrentApprovalStagePayload
    ): Promise<ApprovalStage> {
        return this.stockInRepository.getCurrentApprovalStage(
            payload.resourceName,
            payload.stockStatus
        )
    }
}
