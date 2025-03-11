import UserEntity from '../Entities/UserEntity'
import LoginPayload from '../../Application/Types/LoginPayload'

export const IAuthRepositoryToken = Symbol('IAuthRepository')

export interface IAuthRepository {
    login: (data: LoginPayload) => Promise<UserEntity>
    logout: () => Promise<void>
}
