// src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore.ts
import { useContextStore } from '@/src/Core/Presentation/Hooks/UseContextStore'
import { MasterDataStore } from './MasterDataStore'
import { MasterDataStoreContext } from './MasterDataStoreContext'

export const useMasterDataStore = (): MasterDataStore => {
    const store = useContextStore(MasterDataStoreContext)
    return store
}
