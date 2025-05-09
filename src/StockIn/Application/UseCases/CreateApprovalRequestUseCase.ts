// src/StockIn/Application/UseCases/CreateApprovalRequestUseCase.ts
import { injectable, inject } from 'inversiland'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '../../Domain/Specifications/IStockInRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import { ApprovalRequest } from '../../Domain/Entities/ApprovalRequest'
import { CreateApprovalRequestPayload } from '../Types/CreateApprovalRequestPayload'

@injectable()
export class CreateApprovalRequestUseCase
    implements UseCase<CreateApprovalRequestPayload, Promise<ApprovalRequest>>
{
    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {}

    public execute(
        payload: CreateApprovalRequestPayload
    ): Promise<ApprovalRequest> {
        return this.stockInRepository.createApprovalRequest(
            payload.objectId,
            payload.currentStageId,
            payload.objectType,
            payload.requesterId
        )
    }
}
