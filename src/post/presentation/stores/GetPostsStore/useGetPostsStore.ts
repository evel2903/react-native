import { useContextStore } from '@/src/Core/Presentation/Hooks/UseContextStore'
import { GetPostsStore } from './GetPostsStore'
import { GetPostsStoreContext } from './GetPostsStoreContext'

export const useGetPostsStore = (): GetPostsStore => {
    const store = useContextStore(GetPostsStoreContext)

    return store
}
