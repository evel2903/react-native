import InventoryItemEntity from '../Entities/InventoryItemEntity'
import GetInventoryPayload from '../../Application/Types/GetInventoryPayload'
import GetInventoryResponse from '../../Application/Types/GetInventoryResponse'

export const IInventoryRepositoryToken = Symbol('IInventoryRepository')

export interface IInventoryRepository {
    getInventory: (data: GetInventoryPayload) => Promise<GetInventoryResponse>
    getItemById: (id: string) => Promise<InventoryItemEntity>
}
