export interface ApprovalRequest {
    id: string;
    objectId: string;
    objectType: string;
    requesterId: string;
    currentStageId: string;
    requesterName: string;
    currentStageName: string;
    workflowName: string;
    status: string;
    isActive: boolean;
    updatedAt: string;
    createdAt: string;
    isDeleted: boolean;
}