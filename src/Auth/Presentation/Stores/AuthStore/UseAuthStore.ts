import { useContextStore } from '@/src/Core/Presentation/Hooks/UseContextStore'
import { AuthStore } from './AuthStore'
import { AuthStoreContext } from './AuthStoreContext'

export const useAuthStore = (): AuthStore => {
    const store = useContextStore(AuthStoreContext)

    return store
}
