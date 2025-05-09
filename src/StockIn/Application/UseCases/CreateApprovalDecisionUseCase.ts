// src/StockIn/Application/UseCases/CreateApprovalDecisionUseCase.ts
import { injectable, inject } from 'inversiland'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '../../Domain/Specifications/IStockInRepository'
import { ApprovalDecisionPayload } from '../Types/ApprovalDecisionPayload'
import { ApprovalDecision } from '../../Domain/Entities/ApprovalDecision'
import { UseCase } from '@/src/Core/Application/UseCase'

@injectable()
export class CreateApprovalDecisionUseCase
    implements UseCase<ApprovalDecisionPayload, Promise<ApprovalDecision>>
{
    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {}

    public execute(
        payload: ApprovalDecisionPayload
    ): Promise<ApprovalDecision> {
        return this.stockInRepository.createApprovalDecision(
            payload.requestId,
            payload.approverId,
            payload.comment
        )
    }
}
