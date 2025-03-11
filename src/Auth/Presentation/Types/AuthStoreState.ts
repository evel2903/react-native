import UserEntity from '@/src/Auth/Domain/Entities/UserEntity'

export default interface AuthStoreState {
    isLoading: boolean
    user: UserEntity | null
    isAuthenticated: boolean
    error: string | null
}
