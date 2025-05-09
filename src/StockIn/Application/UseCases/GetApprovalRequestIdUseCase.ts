// src/StockIn/Application/UseCases/GetApprovalRequestIdUseCase.ts

import { injectable, inject } from 'inversiland'
import {
    IStockInRepository,
    IStockInRepositoryToken,
} from '../../Domain/Specifications/IStockInRepository'
import { UseCase } from '@/src/Core/Application/UseCase'
import { GetApprovalRequestIdPayload } from '../Types/GetApprovalRequestIdPayload'

@injectable()
export class GetApprovalRequestIdUseCase
    implements UseCase<GetApprovalRequestIdPayload, Promise<string | null>>
{
    constructor(
        @inject(IStockInRepositoryToken)
        private readonly stockInRepository: IStockInRepository
    ) {}

    public execute(
        payload: GetApprovalRequestIdPayload
    ): Promise<string | null> {
        return this.stockInRepository.getApprovalRequestId(
            payload.objectId,
            payload.objectType || 'StockIn'
        )
    }
}
