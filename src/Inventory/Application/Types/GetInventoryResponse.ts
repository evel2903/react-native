import InventoryRecordEntity from '../../Domain/Entities/InventoryRecordEntity'

export default interface GetInventoryResponse {
    results: InventoryRecordEntity[]
    count: number
}
