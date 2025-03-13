import InventoryRecordEntity from '../Entities/InventoryRecordEntity'
import GetInventoryPayload from '../../Application/Types/GetInventoryPayload'
import GetInventoryResponse from '../../Application/Types/GetInventoryResponse'

export const IInventoryRepositoryToken = Symbol('IInventoryRepository')

export interface IInventoryRepository {
    getInventory: (data: GetInventoryPayload) => Promise<GetInventoryResponse>
    getInventoryRecordById: (id: string) => Promise<InventoryRecordEntity>
    updateInventoryRecordStatus: (
        id: string,
        status: InventoryRecordEntity['status']
    ) => Promise<InventoryRecordEntity>
}