// src/Common/Presentation/Types/MasterDataStoreState.ts
import { CategoryEntity } from '../../Domain/Entities/CategoryEntity'
import { UnitEntity } from '../../Domain/Entities/UnitEntity'
import { SupplierEntity } from '../../Domain/Entities/SupplierEntity'
import { GoodsEntity } from '../../Domain/Entities/GoodsEntity'
import { WarehouseEntity } from '../../Domain/Entities/WarehouseEntity'
import { AreaEntity } from '../../Domain/Entities/AreaEntity'
import { RowEntity } from '../../Domain/Entities/RowEntity'
import { ShelfEntity } from '../../Domain/Entities/ShelfEntity'

export default interface MasterDataStoreState {
    categories: {
        isLoading: boolean
        data: CategoryEntity[]
        error: string | null
    }
    units: {
        isLoading: boolean
        data: UnitEntity[]
        error: string | null
    }
    suppliers: {
        isLoading: boolean
        data: SupplierEntity[]
        error: string | null
    }
    goods: {
        isLoading: boolean
        data: GoodsEntity[]
        error: string | null
    }
    warehouses: {
        isLoading: boolean
        data: WarehouseEntity[]
        error: string | null
    }
    areas: {
        isLoading: boolean
        data: AreaEntity[]
        error: string | null
    }
    rows: {
        isLoading: boolean
        data: RowEntity[]
        error: string | null
    }
    shelfs: {
        isLoading: boolean
        data: ShelfEntity[]
        error: string | null
    }
}
