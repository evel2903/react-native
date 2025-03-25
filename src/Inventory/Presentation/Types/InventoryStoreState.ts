import ListState from '@/src/Core/Presentation/Types/ListState'
import InventoryRecordEntity from '../../Domain/Entities/InventoryRecordEntity'

export default interface InventoryStoreState
    extends ListState<
        InventoryRecordEntity,
        {
            status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
            startDate?: string
            endDate?: string
            location?: string
            search?: string
        }
    > {
    selectedInventoryRecord: InventoryRecordEntity | null
    error: string | null
}
