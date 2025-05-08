export interface ApprovalStage {
    id: string;
    name: string;
    stageOrder: number;
    type: string;
    minApprovals: number;
    workflowId: string;
    isActive: boolean;
    updatedAt: string;
    createdAt: string;
    isDeleted: boolean;
}