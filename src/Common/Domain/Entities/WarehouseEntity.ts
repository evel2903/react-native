// src/Common/Domain/Entities/WarehouseEntity.ts
export interface WarehouseEntity {
    id: string
    code: string
    name: string
    location?: string
    description?: string
    isActive: boolean
    isDeleted: boolean
}