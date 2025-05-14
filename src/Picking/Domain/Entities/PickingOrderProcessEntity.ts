export interface PickingOrderProcessItemEntity {
    id: string
    updatedAt: string
    createdAt: string
    isDeleted: boolean
    pickingOrderId: string
    pickingOrderDetailId: string
    stockLocationId: string
    requestedQuantity: number
    quantityCanPicked: number
    quantityPicked: number
    warehouseName: string
    areaName: string
    rowName: string
    shelfName: string
    level: number
    position: number
    isActive: boolean
    // New fields for goods information
    goodsId: string
    goodsCode: string
    goodsName: string
    // Additional field to track updated quantity for UI state
    updatedQuantityPicked?: number
}

export interface PickingOrderProcessEntity {
    pickingOrderId: string
    items: PickingOrderProcessItemEntity[]
    approvedIsValid: boolean
}
