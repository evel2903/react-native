// src/Tracking/Domain/Entities/GoodsTrackingEntity.ts
export interface GoodsTrackingEntity {
    warehouseName: string
    areaName: string
    rowName: string
    shelfName: string
    level: number
    position: number
    quantity: string
    lockQuantity: string
    availableQuantity: string
}
