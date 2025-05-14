import { useContextStore } from '@/src/Core/Presentation/Hooks/UseContextStore'
import { PickingStore } from './PickingStore'
import { PickingStoreContext } from './PickingStoreContext'

export const usePickingStore = (): PickingStore => {
    const store = useContextStore(PickingStoreContext)

    return store
}
