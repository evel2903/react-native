import StockInEntity from '../../Domain/Entities/StockInEntity'

export interface UpdateStockInStatusPayload {
    id: string
    status: StockInEntity['status']
}
