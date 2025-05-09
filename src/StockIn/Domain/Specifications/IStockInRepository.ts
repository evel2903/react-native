// src/StockIn/Domain/Specifications/IStockInRepository.ts

import StockInEntity from '../Entities/StockInEntity'
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'
import { ApprovalStage } from '../Entities/ApprovalStage'
import { ApprovalRequest } from '../Entities/ApprovalRequest'
import { ApprovalDecision } from '../Entities/ApprovalDecision'

export const IStockInRepositoryToken = Symbol('IStockInRepository')

export interface IStockInRepository {
    getStockIns: (data: GetStockInsPayload) => Promise<{
        results: StockInEntity[]
        count: number
    }>

    getStockInById: (id: string) => Promise<StockInEntity>

    updateStockInStatus: (
        id: string,
        status: StockInEntity['status'],
        stateId: string
    ) => Promise<StockInEntity>

    createStockIn: (data: CreateStockInPayload) => Promise<StockInEntity>

    updateStockIn: (id: string, data: any) => Promise<StockInEntity>

    // Approval process methods
    getCurrentApprovalStage: (
        resourceName: string,
        stockStatus: string
    ) => Promise<ApprovalStage>

    createApprovalRequest: (
        objectId: string,
        currentStageId: string,
        objectType: string,
        requesterId: string
    ) => Promise<ApprovalRequest>

    createApprovalDecision: (
        requestId: string,
        approverId: string,
        comment: string
    ) => Promise<ApprovalDecision>

    // New method for fetching approval request ID
    getApprovalRequestId: (
        objectId: string,
        objectType?: string
    ) => Promise<string | null>

    // Optional methods
    deleteStockIn?: (id: string) => Promise<boolean>
}
