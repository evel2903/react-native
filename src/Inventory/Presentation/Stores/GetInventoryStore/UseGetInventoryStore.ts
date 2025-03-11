import { useContextStore } from '@/src/Core/Presentation/Hooks/UseContextStore'
import { GetInventoryStore } from './GetInventoryStore'
import { GetInventoryStoreContext } from './GetInventoryStoreContext'

export const useGetInventoryStore = (): GetInventoryStore => {
    const store = useContextStore(GetInventoryStoreContext)

    return store
}
