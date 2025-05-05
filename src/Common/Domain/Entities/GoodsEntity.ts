// src/Common/Domain/Entities/GoodsEntity.ts
export interface GoodsEntity {
    id: string
    code: string
    name: string
    customCode?: string | null
    description?: string
    imageName?: string | null
    imageUrl?: string | null
    unitId: string
    unit?: {
        name: string
        isActive: boolean
        isDeleted: boolean
    }
    categoryId: string
    category?: {
        code: string
        name: string
        isActive: boolean
        isDeleted: boolean
    }
    isActive: boolean
    isDeleted: boolean
    stockInAlertQuantity?: number
}
