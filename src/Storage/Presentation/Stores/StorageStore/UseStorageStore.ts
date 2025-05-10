import { useContextStore } from '@/src/Core/Presentation/Hooks/UseContextStore'
import { StorageStore } from './StorageStore'
import { StorageStoreContext } from './StorageStoreContext'

export const useStorageStore = (): StorageStore => {
    const store = useContextStore(StorageStoreContext)

    return store
}