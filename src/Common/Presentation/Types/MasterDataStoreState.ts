// src/Common/Presentation/Types/MasterDataStoreState.ts
import { CategoryEntity } from '../../Domain/Entities/CategoryEntity'
import { UnitEntity } from '../../Domain/Entities/UnitEntity'
import { SupplierEntity } from '../../Domain/Entities/SupplierEntity'
import { GoodsEntity } from '../../Domain/Entities/GoodsEntity'

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
}
