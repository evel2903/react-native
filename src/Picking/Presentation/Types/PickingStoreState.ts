import ListState from '@/src/Core/Presentation/Types/ListState'
import PickingOrderEntity from '../../Domain/Entities/PickingOrderEntity'
import { PriorityType } from '@/src/Common/Domain/Enums/Priority'

export default interface PickingStoreState
    extends ListState<
        PickingOrderEntity,
        {
            code?: string
            status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
            priority?: PriorityType
            assignedTo?: string
            pickingDateStart?: string
            pickingDateEnd?: string
            search?: string
        }
    > {
    selectedPickingOrder: PickingOrderEntity | null
    error: string | null
    filterVisible: boolean
}
