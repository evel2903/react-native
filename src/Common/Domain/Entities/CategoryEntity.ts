// src/Common/Domain/Entities/CategoryEntity.ts
export interface CategoryEntity {
    id: string
    code: string
    name: string
    description?: string
    isActive: boolean
    isDeleted: boolean
}
