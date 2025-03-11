import ListState from 'src/Core/Presentation/Types/ListState'
import StockOutEntity from '../../Domain/Entities/StockOutEntity'
import CreateStockOutPayload from '../../Application/Types/CreateStockOutPayload'

export default interface StockOutStoreState
    extends ListState<
        StockOutEntity,
        {
            status?: 'pending' | 'completed' | 'cancelled'
            startDate?: string
            endDate?: string
            search?: string
        }
    > {
    selectedStockOut: StockOutEntity | null
    isCreating: boolean
    error: string | null

    // Form data for new stock out
    formData: CreateStockOutPayload
}
