import { Expose } from 'class-transformer'
import ResponseDto from '@/src/Core/Infrastructure/Models/ResponseDto'
import UserEntity from '@/src/Auth/Domain/Entities/UserEntity'

export default class UserDto extends ResponseDto<UserEntity> {
    @Expose()
    id!: string

    @Expose()
    username!: string

    @Expose()
    email!: string

    @Expose()
    fullname?: string

    @Expose()
    permissions?: string[]

    toDomain(): UserEntity {
        return {
            id: this.id,
            name: this.fullname || this.username,
            email: this.email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                this.fullname || this.username
            )}&background=random`,
            permissions: this.permissions || [],
        }
    }
}
