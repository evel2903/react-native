import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native'
import {
    Button,
    Text,
    TextInput,
    Surface,
    Snackbar,
    HelperText,
    IconButton,
    Dialog,
    Portal,
    Divider,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { useI18n } from '@/src/Core/Presentation/Hooks/UseI18n'
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { useAuthStore } from '../Stores/AuthStore/UseAuthStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { AuthStoreProvider } from '../Stores/AuthStore/AuthStoreProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL_STORAGE_KEY = 'apiUrl'

const AuthScreen = observer(() => {
    const theme = useTheme()
    const i18n = useI18n()
    const navigation = useNavigation<RootScreenNavigationProp<'Auth'>>()
    const authStore = useAuthStore()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [apiUrl, setApiUrl] = useState('')
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [usernameError, setUsernameError] = useState<string | null>(null)
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [apiUrlError, setApiUrlError] = useState<string | null>(null)
    const [isApiDialogVisible, setIsApiDialogVisible] = useState(false)

    // Load saved API URL when component mounts
    useEffect(() => {
        loadSavedApiUrl()
    }, [])

    const loadSavedApiUrl = async () => {
        try {
            const savedApiUrl = await AsyncStorage.getItem(API_URL_STORAGE_KEY)
            if (savedApiUrl) {
                setApiUrl(savedApiUrl)
                // Also set it in the auth store for immediate use
                authStore.setApiUrl(savedApiUrl)
            }
        } catch (error) {
            console.error('Failed to load API URL from storage:', error)
        }
    }

    const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible)

    const validateUsername = (value: string): boolean => {
        if (!value) {
            setUsernameError(i18n.t('auth.errors.usernameRequired'))
            return false
        }

        // Basic username validation
        if (value.length < 3) {
            setUsernameError(i18n.t('auth.errors.usernameTooShort'))
            return false
        }

        setUsernameError(null)
        return true
    }

    const validatePassword = (password: string): boolean => {
        if (!password) {
            setPasswordError(i18n.t('auth.errors.passwordRequired'))
            return false
        }

        setPasswordError(null)
        return true
    }

    const validateApiUrl = (url: string): boolean => {
        if (!url) {
            setApiUrlError('API URL is required')
            return false
        }

        // Basic URL validation
        try {
            new URL(url)
            setApiUrlError(null)
            return true
        } catch (e) {
            setApiUrlError('Please enter a valid URL (including http:// or https://)')
            return false
        }
    }

    const validateInputs = (): boolean => {
        const isUsernameValid = validateUsername(username)
        const isPasswordValid = validatePassword(password)
        
        // Validate API URL if it hasn't been set yet
        if (!authStore.apiUrl && !validateApiUrl(apiUrl)) {
            setIsApiDialogVisible(true)
            return false
        }

        return isUsernameValid && isPasswordValid
    }

    const saveApiUrl = async (url: string) => {
        try {
            await AsyncStorage.setItem(API_URL_STORAGE_KEY, url)
            // Update the API URL in the auth store
            authStore.setApiUrl(url)
        } catch (error) {
            console.error('Failed to save API URL to storage:', error)
            authStore.setError('Failed to save API URL. Please try again.')
        }
    }

    const handleLogin = async () => {
        if (!validateInputs()) return

        // If API URL is set in the form but not saved yet, save it
        if (apiUrl && (!authStore.apiUrl || authStore.apiUrl !== apiUrl)) {
            await saveApiUrl(apiUrl)
        }

        const success = await authStore.login({ username, password })
        if (success) {
            // Use replace instead of navigate to remove Auth screen from history
            navigation.replace('Home')
        }
    }

    const handleSaveApiUrl = async () => {
        if (validateApiUrl(apiUrl)) {
            await saveApiUrl(apiUrl)
            setIsApiDialogVisible(false)
            authStore.setError(null)
        }
    }

    const handleUsernameChange = (text: string) => {
        setUsername(text)
        if (usernameError) validateUsername(text)
    }

    const handlePasswordChange = (text: string) => {
        setPassword(text)
        if (passwordError) validatePassword(text)
    }

    const handleApiUrlChange = (text: string) => {
        setApiUrl(text)
        if (apiUrlError) validateApiUrl(text)
    }

    return (
        <View
            style={{ flex: 1, backgroundColor: theme.theme.colors.background }}
        >
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView
                style={{ flex: 1 }}
                edges={['right', 'left', 'bottom']}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.header}>
                            <Text variant="headlineMedium" style={styles.title}>
                                {i18n.t('auth.screens.Auth.welcomeBack')}
                            </Text>
                            <Text variant="bodyMedium" style={styles.subtitle}>
                                {i18n.t('auth.screens.Auth.signInContinue')}
                            </Text>
                        </View>

                        <Surface style={styles.authForm} elevation={1}>
                            <View style={styles.formHeader}>
                                <Text variant="titleMedium">Login</Text>
                                <IconButton
                                    icon="cog"
                                    size={20}
                                    onPress={() => setIsApiDialogVisible(true)}
                                    style={styles.settingsButton}
                                />
                            </View>
                            <Divider style={styles.divider} />
                            <View style={styles.formContent}>
                                <TextInput
                                    dense
                                    label="Username"
                                    value={username}
                                    onChangeText={handleUsernameChange}
                                    mode="outlined"
                                    autoCapitalize="none"
                                    left={<TextInput.Icon icon="account" />}
                                    style={styles.input}
                                    error={!!usernameError}
                                    onBlur={() => validateUsername(username)}
                                />
                                {usernameError && (
                                    <HelperText
                                        type="error"
                                        visible={!!usernameError}
                                    >
                                        {usernameError}
                                    </HelperText>
                                )}

                                <TextInput
                                    dense
                                    label={i18n.t('auth.screens.Auth.password')}
                                    value={password}
                                    onChangeText={handlePasswordChange}
                                    mode="outlined"
                                    secureTextEntry={!passwordVisible}
                                    left={<TextInput.Icon icon="lock" />}
                                    right={
                                        <TextInput.Icon
                                            icon={
                                                passwordVisible
                                                    ? 'eye-off'
                                                    : 'eye'
                                            }
                                            onPress={togglePasswordVisibility}
                                        />
                                    }
                                    style={styles.input}
                                    error={!!passwordError}
                                    onBlur={() => validatePassword(password)}
                                />
                                {passwordError && (
                                    <HelperText
                                        type="error"
                                        visible={!!passwordError}
                                    >
                                        {passwordError}
                                    </HelperText>
                                )}

                                <Button
                                    mode="text"
                                    compact
                                    style={styles.forgotPassword}
                                >
                                    {i18n.t('auth.screens.Auth.forgotPassword')}
                                </Button>

                                <Button
                                    mode="contained"
                                    onPress={handleLogin}
                                    style={styles.submitButton}
                                    loading={authStore.isLoading}
                                    disabled={authStore.isLoading}
                                >
                                    {i18n.t('auth.screens.Auth.login')}
                                </Button>
                            </View>
                        </Surface>
                    </ScrollView>
                </KeyboardAvoidingView>

                <Portal>
                    <Dialog
                        visible={isApiDialogVisible}
                        onDismiss={() => setIsApiDialogVisible(false)}
                    >
                        <Dialog.Title>API Configuration</Dialog.Title>
                        <Dialog.Content>
                            <TextInput
                                label="API URL"
                                value={apiUrl}
                                onChangeText={handleApiUrlChange}
                                mode="outlined"
                                autoCapitalize="none"
                                placeholder="https://api-url.com"
                                error={!!apiUrlError}
                            />
                            {apiUrlError && (
                                <HelperText type="error" visible={!!apiUrlError}>
                                    {apiUrlError}
                                </HelperText>
                            )}
                            <Text variant="bodySmall" style={styles.helpText}>
                                Enter the full URL of the API including http:// or https://
                            </Text>
                            {authStore.apiUrl && (
                                <Text variant="bodySmall" style={styles.currentUrlText}>
                                    Current URL: {authStore.apiUrl}
                                </Text>
                            )}
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setIsApiDialogVisible(false)}>Cancel</Button>
                            <Button onPress={handleSaveApiUrl}>Save</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                <Snackbar
                    visible={!!authStore.error}
                    onDismiss={() => authStore.setError(null)}
                    duration={3000}
                    action={{
                        label: i18n.t('common.close'),
                        onPress: () => authStore.setError(null),
                    }}
                >
                    {authStore.error}
                </Snackbar>
            </SafeAreaView>
        </View>
    )
})

const styles = StyleSheet.create({
    keyboardAvoidView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 16,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginTop: 8,
    },
    authForm: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    divider: {
        marginBottom: 8,
    },
    formContent: {
        padding: 16,
        paddingTop: 8,
    },
    input: {
        marginBottom: 4,
    },
    settingsButton: {
        margin: 0,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginBottom: 16,
    },
    submitButton: {
        marginTop: 8,
        marginBottom: 16,
    },
    helpText: {
        marginTop: 8,
        opacity: 0.7,
    },
    currentUrlText: {
        marginTop: 8,
        opacity: 0.7,
        fontStyle: 'italic',
    }
})

export default withProviders(AuthStoreProvider)(AuthScreen)