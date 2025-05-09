// src/StockIn/Domain/Entities/ApprovalDecision.ts
export interface ApprovalDecision {
    id: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    requestId: string
    stageId: string
    stageName: string
    requestStatus: string
    decision: string
    comment: string
    decidedAt: string
    isActive: boolean
}
