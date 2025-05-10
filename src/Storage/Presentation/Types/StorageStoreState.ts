import ListState from '@/src/Core/Presentation/Types/ListState'
import StorageVoucherEntity from '../../Domain/Entities/StorageVoucherEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export default interface StorageStoreState
    extends ListState<
        StorageVoucherEntity,
        {
            code?: string
            status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
            priority?: PriorityType
            assignedTo?: string
            storageDateStart?: string
            storageDateEnd?: string
            search?: string
        }
    > {
    selectedStorageVoucher: StorageVoucherEntity | null
    error: string | null
    filterVisible: boolean
}
