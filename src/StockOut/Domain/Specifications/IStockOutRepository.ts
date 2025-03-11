import StockOutEntity from '../Entities/StockOutEntity'
import GetStockOutsPayload from '../../Application/Types/GetStockOutsPayload'
import CreateStockOutPayload from '../../Application/Types/CreateStockOutPayload'

export const IStockOutRepositoryToken = Symbol('IStockOutRepository')

export interface IStockOutRepository {
    getStockOuts: (data: GetStockOutsPayload) => Promise<{
        results: StockOutEntity[]
        count: number
    }>

    getStockOutById: (id: string) => Promise<StockOutEntity>

    createStockOut: (data: CreateStockOutPayload) => Promise<StockOutEntity>

    updateStockOutStatus: (
        id: string,
        status: StockOutEntity['status']
    ) => Promise<StockOutEntity>
}
