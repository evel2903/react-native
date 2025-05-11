// src/Common/Domain/Entities/RowEntity.ts
export interface RowEntity {
    id: string
    code: string
    name: string
    areaId: string
    area?: {
        isActive: boolean
        isDeleted: boolean
        code: string
        name: string
        warehouseId: string
        warehouse?: {
            isActive: boolean
            isDeleted: boolean
            id: string
            updatedAt: string
            createdAt: string
            code: string
            name: string
            location: string
            description: string
        }
    }
    isActive: boolean
    isDeleted: boolean
}