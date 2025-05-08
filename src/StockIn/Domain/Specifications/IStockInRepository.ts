//src/StockIn/Domain/Specifications/IStockInRepository.ts

import StockInEntity from '../Entities/StockInEntity'
import GetStockInsPayload from '../../Application/Types/GetStockInsPayload'
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload'
import IHttpClient from '@/src/Core/Domain/Specifications/IHttpClient'

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

    createStockIn: (data: CreateStockInPayload) => Promise<StockInEntity>

    // Optional: Add deleteStockIn method
    deleteStockIn?: (id: string) => Promise<boolean>
}
