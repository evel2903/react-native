import ListState from '@/src/Core/Presentation/Types/ListState'
import PostEntity from 'src/post/domain/entities/PostEntity'

type GetPostsStoreState = ListState<PostEntity>

export default GetPostsStoreState
