import axios, { AxiosRequestConfig } from 'axios'
import { inject, injectable } from 'inversiland'
import IHttpClient from '../../Domain/Specifications/IHttpClient'
import AsyncStorage from '@react-native-async-storage/async-storage'

const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const API_URL_STORAGE_KEY = 'apiUrl'

@injectable()
class HttpClient implements IHttpClient {
    private axios: typeof axios
    private baseUrl: string | null = null

    constructor() {
        this.axios = axios

        // Initialize axios with interceptors
        this.setupInterceptors()
    }

    private setupInterceptors() {
        axios.interceptors.request.use(async requestConfig => {
            // Add auth token if available
            try {
                const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY)
                if (token) {
                    requestConfig.headers = requestConfig.headers || {}
                    requestConfig.headers.Authorization = `Bearer ${token}`
                }

                // Add baseUrl if available
                if (this.baseUrl) {
                    requestConfig.baseURL = this.baseUrl
                } else {
                    // Try to load from AsyncStorage if not set yet
                    const savedBaseUrl = await AsyncStorage.getItem(
                        API_URL_STORAGE_KEY
                    )
                    if (savedBaseUrl) {
                        this.baseUrl = savedBaseUrl
                        requestConfig.baseURL = savedBaseUrl
                    }
                }
            } catch (error) {
                console.error('Error in request interceptor:', error)
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
                        if (refreshToken && this.baseUrl) {
                            const response = await axios.post(
                                `${this.baseUrl}/api/auth/refresh-token`,
                                { refreshToken }
                            )

                            // Check if the refresh was successful
                            if (response.data.status === 'success') {
                                const newAccessToken = response.data.accessToken

                                // Save the new access token
                                await AsyncStorage.setItem(
                                    ACCESS_TOKEN_KEY,
                                    newAccessToken
                                )

                                // Update the authorization header
                                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

                                // Retry the original request
                                return axios(originalRequest)
                            }
                        }
                    } catch (error) {
                        console.error('Token refresh error:', error)
                        // Clear tokens on refresh failure
                        await AsyncStorage.removeItem(ACCESS_TOKEN_KEY)
                        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY)

                        // Token refresh failed or refresh token expired
                        // This would typically be handled by your auth store to redirect to login
                    }
                }
            }

            return Promise.reject(err)
        })
    }

    public setBaseUrl(url: string): void {
        this.baseUrl = url
        // No need to save to AsyncStorage here as this is handled by the AuthStore
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

    public put<DataType, ResponseType>(
        url: string,
        data?: DataType,
        config?: AxiosRequestConfig
    ) {
        return this.axios
            .put<ResponseType>(url, data, config)
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
