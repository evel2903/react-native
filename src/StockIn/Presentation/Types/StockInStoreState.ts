import ListState from 'src/Core/Presentation/Types/ListState'
import StockInEntity from '../../Domain/Entities/StockInEntity'

export default interface StockInStoreState
    extends ListState<
        StockInEntity,
        {
            status?: 'pending' | 'processing' | 'completed' | 'cancelled'
            startDate?: string
            endDate?: string
            search?: string
        }
    > {
    selectedStockIn: StockInEntity | null
    error: string | null
}
