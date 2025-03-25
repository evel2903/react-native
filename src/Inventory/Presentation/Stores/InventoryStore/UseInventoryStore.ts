import { useContextStore } from '@/src/Core/Presentation/Hooks/UseContextStore'
import { InventoryStore } from './InventoryStore'
import { InventoryStoreContext } from './InventoryStoreContext'

export const useInventoryStore = (): InventoryStore => {
    const store = useContextStore(InventoryStoreContext)

    return store
}
