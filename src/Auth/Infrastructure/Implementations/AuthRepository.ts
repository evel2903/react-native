import { injectable, inject } from 'inversiland'
import { IAuthRepository } from '../../Domain/Specifications/IAuthRepository'
import LoginPayload from '../../Application/Types/LoginPayload'
import UserEntity from '../../Domain/Entities/UserEntity'
import IHttpClient, {
    IHttpClientToken,
} from '@/src/Core/Domain/Specifications/IHttpClient'
import { plainToInstance } from 'class-transformer'
import UserDto from '../Models/UserDto'

@injectable()
class AuthRepository implements IAuthRepository {
    private readonly baseUrl = '/api/auth'

    constructor(
        @inject(IHttpClientToken) private readonly httpClient: IHttpClient
    ) {}

    public async login(credentials: LoginPayload): Promise<UserEntity> {
        try {
            // Make the API request
            const response: any = await this.httpClient.post(
                `${this.baseUrl}/login`,
                credentials
            )

            // Check if the response is successful
            if (response.status !== 'success') {
                throw new Error(response.message || 'Login failed')
            }

            // Extract tokens and user data from the response
            const { accessToken, refreshToken, user } = response.data

            // Store tokens
            await this.httpClient.storeTokens(accessToken, refreshToken)

            // Transform to domain entity using UserDto
            const userDto = plainToInstance(UserDto, user)

            return userDto.toDomain()
        } catch (error) {
            console.error('Login error:', error)
            throw new Error(
                error instanceof Error ? error.message : 'Login failed'
            )
        }
    }

    public async logout(): Promise<void> {
        try {
            // In a real app, you might need to invalidate the token on server side
            // await this.httpClient.post(`${this.baseUrl}/logout`);

            // Clear tokens
            await this.httpClient.clearTokens()
            return
        } catch (error) {
            console.error('Logout error:', error)
            throw new Error(
                error instanceof Error ? error.message : 'Logout failed'
            )
        }
    }
}

export default AuthRepository