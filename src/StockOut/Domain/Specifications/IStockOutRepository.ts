// src/StockOut/Domain/Specifications/IStockOutRepository.ts
import StockOutEntity from '../Entities/StockOutEntity'
import GetStockOutsPayload from '../../Application/Types/GetStockOutsPayload'

export const IStockOutRepositoryToken = Symbol('IStockOutRepository')

export interface IStockOutRepository {
    getStockOuts: (data: GetStockOutsPayload) => Promise<{
        results: StockOutEntity[]
        count: number
    }>

    getStockOutById: (id: string) => Promise<StockOutEntity>

    updateStockOutStatus: (
        id: string,
        status: StockOutEntity['status'],
        stateId: string
    ) => Promise<StockOutEntity>

    // Optional methods
    deleteStockOut?: (id: string) => Promise<boolean>
}
