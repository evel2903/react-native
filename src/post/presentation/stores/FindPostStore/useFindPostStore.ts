import { FindPostStore } from './FindPostStore'
import { FindPostStoreContext } from './FindPostStoreContext'
import { useContextStore } from '@/src/Core/Presentation/Hooks/UseContextStore'

export const useFindPostStore = (): FindPostStore => {
    const store = useContextStore(FindPostStoreContext)

    return store
}
