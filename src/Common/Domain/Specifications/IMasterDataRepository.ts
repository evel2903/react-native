// src/Common/Domain/Specifications/IMasterDataRepository.ts
import { CategoryEntity } from '../Entities/CategoryEntity'
import { UnitEntity } from '../Entities/UnitEntity'
import { SupplierEntity } from '../Entities/SupplierEntity'
import { GoodsEntity } from '../Entities/GoodsEntity'
import { WarehouseEntity } from '../Entities/WarehouseEntity'
import { AreaEntity } from '../Entities/AreaEntity'
import { RowEntity } from '../Entities/RowEntity'
import { ShelfEntity } from '../Entities/ShelfEntity'

export const IMasterDataRepositoryToken = Symbol('IMasterDataRepository')

export interface IMasterDataRepository {
    // Existing methods
    getCategories(): Promise<CategoryEntity[]>
    getUnits(): Promise<UnitEntity[]>
    getSuppliers(): Promise<SupplierEntity[]>
    getGoods(): Promise<GoodsEntity[]>
    getGoodsByCode(code: string): Promise<GoodsEntity | null>

    getCategoryById(id: string): Promise<CategoryEntity | null>
    getUnitById(id: string): Promise<UnitEntity | null>
    getSupplierById(id: string): Promise<SupplierEntity | null>
    getGoodsById(id: string): Promise<GoodsEntity | null>

    // New methods
    getWarehouses(): Promise<WarehouseEntity[]>
    getAreas(): Promise<AreaEntity[]>
    getRows(): Promise<RowEntity[]>
    getShelfs(): Promise<ShelfEntity[]>

    getWarehouseById(id: string): Promise<WarehouseEntity | null>
    getAreaById(id: string): Promise<AreaEntity | null>
    getRowById(id: string): Promise<RowEntity | null>
    getShelfById(id: string): Promise<ShelfEntity | null>
}
