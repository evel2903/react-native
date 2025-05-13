// src/StockOut/Presentation/Types/StockOutStoreState.ts
import ListState from 'src/Core/Presentation/Types/ListState'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export default interface StockOutStoreState
    extends ListState<
        StockOutEntity,
        {
            code?: string
            status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
            priority?: PriorityType
            receiverId?: string
            startDate?: string
            endDate?: string
            search?: string
        }
    > {
    selectedStockOut: StockOutEntity | null
    error: string | null
    filterVisible: boolean
}