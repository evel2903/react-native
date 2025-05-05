import ListState from 'src/Core/Presentation/Types/ListState'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export default interface StockInStoreState
    extends ListState<
        StockInEntity,
        {
            code?: string
            status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
            priority?: PriorityType
            supplierId?: string
            lotNumber?: string
            startDate?: string
            endDate?: string
            search?: string
        }
    > {
    selectedStockIn: StockInEntity | null
    error: string | null
    filterVisible: boolean
}
