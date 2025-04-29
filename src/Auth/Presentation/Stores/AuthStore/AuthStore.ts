import { injectable, inject } from 'inversiland'
import { makeAutoObservable } from 'mobx'
import AuthStoreState from '../../Types/AuthStoreState'
import UserEntity from '@/src/Auth/Domain/Entities/UserEntity'
import LoginUseCase from '@/src/Auth/Application/UseCases/LoginUseCase'
import LogoutUseCase from '@/src/Auth/Application/UseCases/LogoutUseCase'
import LoginPayload from '@/src/Auth/Application/Types/LoginPayload'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'
import AsyncStorage from '@react-native-async-storage/async-storage'

const USER_DATA_KEY = 'userData'

@injectable()
export class AuthStore implements AuthStoreState {
    isLoading = false
    user: UserEntity | null = null
    isAuthenticated = false
    error: string | null = null

    constructor(
        @inject(LoginUseCase) private loginUseCase: LoginUseCase,
        @inject(LogoutUseCase) private logoutUseCase: LogoutUseCase,
        @inject(IHttpClientToken) private httpClient: IHttpClient
    ) {
        makeAutoObservable(this)
        // Try to restore user session on startup
        this.restoreSession()
    }

    setIsLoading(isLoading: boolean) {
        this.isLoading = isLoading
    }

    setUser(user: UserEntity | null) {
        this.user = user
        this.isAuthenticated = !!user

        // Save user data to persistent storage
        if (user) {
            AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user))
        } else {
            AsyncStorage.removeItem(USER_DATA_KEY)
        }
    }

    setError(error: string | null) {
        this.error = error
    }

    async restoreSession() {
        try {
            // Check if we have user data stored
            const userData = await AsyncStorage.getItem(USER_DATA_KEY)
            if (userData) {
                const user = JSON.parse(userData) as UserEntity
                this.setUser(user)
            }
        } catch (error) {
            console.error('Failed to restore session:', error)
            // If there's an error, clear any potentially corrupted data
            this.clearSession()
        }
    }

    clearSession() {
        this.setUser(null)
        this.httpClient.clearTokens()
    }

    validateCredentials(credentials: LoginPayload): boolean {
        const { username, password } = credentials

        // Basic validation
        if (!username) {
            this.setError('Username is required')
            return false
        }

        if (!password || password.length < 1) {
            this.setError('Password is required')
            return false
        }

        return true
    }

    async login(credentials: LoginPayload) {
        try {
            this.setIsLoading(true)
            this.setError(null)

            // Validate credentials before proceeding
            if (!this.validateCredentials(credentials)) {
                return false
            }

            // Make login API request - tokens will be stored by the repository
            const user = await this.loginUseCase.execute(credentials)

            // Set user data
            this.setUser(user)
            return true
        } catch (error) {
            this.setError(
                error instanceof Error ? error.message : 'Login failed'
            )
            return false
        } finally {
            this.setIsLoading(false)
        }
    }

    async logout() {
        try {
            this.setIsLoading(true)
            await this.logoutUseCase.execute()
            this.clearSession()
            this.setError(null)
        } catch (error) {
            this.setError(
                error instanceof Error ? error.message : 'Logout failed'
            )
        } finally {
            this.setIsLoading(false)
        }
    }

    // Check if the user has specific permission
    hasPermission(permission: string): boolean {
        return this.user?.permissions?.includes(permission) || false
    }

    // Check if the user has any of the specified permissions
    hasAnyPermission(permissions: string[]): boolean {
        return permissions.some(perm => this.hasPermission(perm))
    }

    // Check if the user has all of the specified permissions
    hasAllPermissions(permissions: string[]): boolean {
        return permissions.every(perm => this.hasPermission(perm))
    }
}