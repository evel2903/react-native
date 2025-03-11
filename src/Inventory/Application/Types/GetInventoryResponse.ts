import InventoryItemEntity from '../../Domain/Entities/InventoryItemEntity'

export default interface GetInventoryResponse {
    results: InventoryItemEntity[]
    count: number
}
