import ListState from '@/src/Core/Presentation/Types/ListState'
import InventoryItemEntity from '../../Domain/Entities/InventoryItemEntity'

type GetInventoryStoreState = ListState<
    InventoryItemEntity,
    {
        category?: string
        search?: string
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
    }
>

export default GetInventoryStoreState
