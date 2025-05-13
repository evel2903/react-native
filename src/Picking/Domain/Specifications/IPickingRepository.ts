import PickingOrderEntity, { PickingOrderItemEntity } from '../Entities/PickingOrderEntity'

export const IPickingRepositoryToken = Symbol('IPickingRepository')

export interface GetPickingOrdersPayload {
    page: number
    pageSize: number
    code?: string
    status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
    priority?: number
    assignedTo?: string
    pickingDateStart?: string
    pickingDateEnd?: string
    search?: string
}

export interface IPickingRepository {
    getPickingOrders: (data: GetPickingOrdersPayload) => Promise<{
        results: PickingOrderEntity[]
        count: number
    }>

    getPickingOrderById: (id: string) => Promise<PickingOrderEntity>

    updatePickingOrderStatus: (
        id: string,
        status: PickingOrderEntity['status']
    ) => Promise<PickingOrderEntity>

    createPickingOrder: (data: any) => Promise<PickingOrderEntity>

    updatePickingOrder: (
        id: string,
        data: any
    ) => Promise<PickingOrderEntity>

    createOrUpdatePickingOrderItem: (data: any) => Promise<PickingOrderItemEntity>

    sendProcessCompletedEmail: (id: string) => Promise<{ statusCode: number; message: string }>

    // Optional methods
    deletePickingOrder?: (id: string) => Promise<boolean>
}