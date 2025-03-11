import PayloadDto from '@/src/Core/Infrastructure/Models/PayloadDto'
import GetPostsPayload from 'src/post/application/types/GetPostsPayload'
import { Expose } from 'class-transformer'

export default class GetPostsQuery extends PayloadDto<GetPostsPayload> {
    @Expose()
    page!: number

    @Expose()
    pageSize!: number

    transform(payload: GetPostsPayload) {
        return {
            page: payload.page,
            pageSize: payload.pageSize,
        }
    }
}
