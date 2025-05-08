// src/Common/Domain/Specifications/IMasterDataRepository.ts
import { CategoryEntity } from '../Entities/CategoryEntity'
import { UnitEntity } from '../Entities/UnitEntity'
import { SupplierEntity } from '../Entities/SupplierEntity'
import { GoodsEntity } from '../Entities/GoodsEntity'

export const IMasterDataRepositoryToken = Symbol('IMasterDataRepository')

export interface IMasterDataRepository {
    getCategories(): Promise<CategoryEntity[]>
    getUnits(): Promise<UnitEntity[]>
    getSuppliers(): Promise<SupplierEntity[]>
    getGoods(): Promise<GoodsEntity[]>
    
    // New method to fetch goods by code
    getGoodsByCode(code: string): Promise<GoodsEntity | null>

    getCategoryById(id: string): Promise<CategoryEntity | null>
    getUnitById(id: string): Promise<UnitEntity | null>
    getSupplierById(id: string): Promise<SupplierEntity | null>
    getGoodsById(id: string): Promise<GoodsEntity | null>
}