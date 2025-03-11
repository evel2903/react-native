import ListState from 'src/Core/Presentation/Types/ListState'
import StockInEntity from '../../Domain/Entities/StockInEntity'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'

export default interface StockInStoreState
    extends ListState<
        StockInEntity,
        {
            status?: 'pending' | 'completed' | 'cancelled'
            startDate?: string
            endDate?: string
            search?: string
        }
    > {
    selectedStockIn: StockInEntity | null
    isCreating: boolean
    error: string | null

    // Form data for new stock in
    formData: CreateStockInPayload
}
