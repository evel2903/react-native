// src/Common/Domain/Entities/ShelfEntity.ts
export interface ShelfEntity {
    id: string
    code: string
    name: string
    rowId: string
    levelCount: number
    positionsPerLevel: number
    row?: {
        isActive: boolean
        isDeleted: boolean
        code: string
        name: string
        area?: {
            isActive: boolean
            isDeleted: boolean
            id: string
            updatedAt: string
            createdAt: string
            code: string
            name: string
            description: string
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
    }
    isActive: boolean
    isDeleted: boolean
}