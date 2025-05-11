// src/Common/Domain/Entities/AreaEntity.ts
export interface AreaEntity {
    id: string
    code: string
    name: string
    description?: string
    warehouseId: string
    warehouse?: {
        isActive: boolean
        isDeleted: boolean
        code: string
        name: string
    }
    isActive: boolean
    isDeleted: boolean
}