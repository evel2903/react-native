import StockInEntity from '../Entities/StockInEntity'
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'

export const IStockInRepositoryToken = Symbol('IStockInRepository')

export interface IStockInRepository {
    getStockIns: (data: GetStockInsPayload) => Promise<{
        results: StockInEntity[]
        count: number
    }>

    getStockInById: (id: string) => Promise<StockInEntity>

    createStockIn: (data: CreateStockInPayload) => Promise<StockInEntity>

    updateStockInStatus: (
        id: string,
        status: StockInEntity['status']
    ) => Promise<StockInEntity>
}
