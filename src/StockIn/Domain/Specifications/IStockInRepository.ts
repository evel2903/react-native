import StockInEntity from '../Entities/StockInEntity'
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload'

export const IStockInRepositoryToken = Symbol('IStockInRepository')

export interface IStockInRepository {
    getStockIns: (data: GetStockInsPayload) => Promise<{
        results: StockInEntity[]
        count: number
    }>

    getStockInById: (id: string) => Promise<StockInEntity>

    updateStockInStatus: (
        id: string,
        status: StockInEntity['status']
    ) => Promise<StockInEntity>
}
