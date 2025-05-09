// src/StockIn/Domain/Specifications/IStockInRepository.ts

import StockInEntity from '../Entities/StockInEntity'
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'
import { ApprovalStage } from '../Entities/ApprovalStage'
import { ApprovalRequest } from '../Entities/ApprovalRequest'

export const IStockInRepositoryToken = Symbol('IStockInRepository')

export interface IStockInRepository {
    getStockIns: (data: GetStockInsPayload) => Promise<{
        results: StockInEntity[]
        count: number
    }>

    getStockInById: (id: string) => Promise<StockInEntity>

    updateStockInStatus: (
        id: string,
        status: StockInEntity['status']
    ) => Promise<StockInEntity>

    createStockIn: (data: CreateStockInPayload) => Promise<StockInEntity>

    // New method for updating stock in records
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

    // Optional methods
    deleteStockIn?: (id: string) => Promise<boolean>
}
