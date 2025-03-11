import axios, { AxiosRequestConfig } from 'axios'
import { inject, injectable } from 'inversiland'
import IHttpClient from '../../Domain/Specifications/IHttpClient'
import Env, { EnvToken } from '@/src/Core/Domain/Entities/Env'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

@injectable()
class HttpClient implements IHttpClient {
    private axios: typeof axios

    constructor(@inject(EnvToken) private readonly env: Env) {
        this.axios = axios

        axios.interceptors.request.use(async requestConfig => {
            // Use the API URL from env
            requestConfig.baseURL = env.apiUrl

            // Add auth token if available
            try {
                const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
                if (token) {
                    requestConfig.headers = requestConfig.headers || {}
                    requestConfig.headers.Authorization = `Bearer ${token}`
                }
            } catch (error) {
                console.error('Error retrieving token:', error)
            }

            return requestConfig
        })

        this.axios.interceptors.response.use(undefined, async err => {
            if (err.response) {
                const originalRequest = err.config
                // Handle 401 Unauthorized - Token expired
                if (err.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true

                    try {
                        // Try to refresh the token
                        const refreshToken = await AsyncStorage.getItem(
                            REFRESH_TOKEN_KEY
                        )
                        if (refreshToken) {
                            const response = await axios.post(
                                `${env.apiUrl}/api/auth/refresh-token`,
                                { refreshToken }
                            )

                            if (response.data.data?.accessToken) {
                                // Save the new tokens
                                await AsyncStorage.setItem(
                                    ACCESS_TOKEN_KEY,
                                    response.data.data.accessToken
                                )
                                if (response.data.data.refreshToken) {
                                    await AsyncStorage.setItem(
                                        REFRESH_TOKEN_KEY,
                                        response.data.data.refreshToken
                                    )
                                }

                                // Update the authorization header
                                originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`

                                // Retry the original request
                                return axios(originalRequest)
                            }
                        }
                    } catch (error) {
                        console.error('Token refresh error:', error)
                        // Clear tokens on refresh failure
                        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY)
                        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY)

                        // TODO: Add logic to navigate to login screen
                        // This would typically be handled by your auth store
                    }
                }
            }

            return Promise.reject(err)
        })
    }

    public get<ResponseType>(url: string, config?: AxiosRequestConfig) {
        return this.axios
            .get<ResponseType>(url, config)
            .then(response => response.data)
    }

    public post<DataType, ResponseType>(
        url: string,
        data?: DataType,
        config?: AxiosRequestConfig
    ) {
        return this.axios
            .post<ResponseType>(url, data, config)
            .then(response => response.data)
    }

    public patch<DataType, ResponseType>(
        url: string,
        data?: DataType,
        config?: AxiosRequestConfig
    ) {
        return this.axios
            .patch<ResponseType>(url, data, config)
            .then(response => response.data)
    }

    public delete<ResponseType>(url: string, config?: AxiosRequestConfig) {
        return this.axios
            .delete<ResponseType>(url, config)
            .then(response => response.data)
    }

    // Add methods to store and clear tokens
    public async storeTokens(
        accessToken: string,
        refreshToken: string
    ): Promise<void> {
        await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }

    public async clearTokens(): Promise<void> {
        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY)
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
    }
}

export default HttpClient
