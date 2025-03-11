import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, Text, TextInput, Surface, Snackbar, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider';
import { useI18n } from '@/src/Core/Presentation/Hooks/UseI18n';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index';
import { observer } from 'mobx-react';
import { useAuthStore } from '../Stores/AuthStore/UseAuthStore';
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders';
import { AuthStoreProvider } from '../Stores/AuthStore/AuthStoreProvider';

const AuthScreen = observer(() => {
    const theme = useTheme();
    const i18n = useI18n();
    const navigation = useNavigation<RootScreenNavigationProp<'Auth'>>();
    const authStore = useAuthStore();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

    const validateUsername = (value: string): boolean => {
        if (!value) {
            setUsernameError(i18n.t('auth.errors.usernameRequired'));
            return false;
        }
        
        // Basic username validation
        if (value.length < 3) {
            setUsernameError(i18n.t('auth.errors.usernameTooShort'));
            return false;
        }
        
        setUsernameError(null);
        return true;
    };

    const validatePassword = (password: string): boolean => {
        if (!password) {
            setPasswordError(i18n.t('auth.errors.passwordRequired'));
            return false;
        }
        
        setPasswordError(null);
        return true;
    };

    const validateInputs = (): boolean => {
        const isUsernameValid = validateUsername(username);
        const isPasswordValid = validatePassword(password);
        
        return isUsernameValid && isPasswordValid;
    };

    const handleLogin = async () => {
        if (!validateInputs()) return;

        const success = await authStore.login({ username, password });
        if (success) {
            // Use replace instead of navigate to remove Auth screen from history
            navigation.replace('Home');
        }
    };

    const handleUsernameChange = (text: string) => {
        setUsername(text);
        if (usernameError) validateUsername(text);
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        if (passwordError) validatePassword(text);
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.theme.colors.background }}>
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView style={{ flex: 1 }} edges={['right', 'left', 'bottom']}>
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
                            <View style={styles.formContent}>
                                <TextInput
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
                                    <HelperText type="error" visible={!!usernameError}>
                                        {usernameError}
                                    </HelperText>
                                )}

                                <TextInput
                                    label={i18n.t('auth.screens.Auth.password')}
                                    value={password}
                                    onChangeText={handlePasswordChange}
                                    mode="outlined"
                                    secureTextEntry={!passwordVisible}
                                    left={<TextInput.Icon icon="lock" />}
                                    right={
                                        <TextInput.Icon
                                            icon={passwordVisible ? 'eye-off' : 'eye'}
                                            onPress={togglePasswordVisibility}
                                        />
                                    }
                                    style={styles.input}
                                    error={!!passwordError}
                                    onBlur={() => validatePassword(password)}
                                />
                                {passwordError && (
                                    <HelperText type="error" visible={!!passwordError}>
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
    );
});

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
    formContent: {
        padding: 16,
    },
    input: {
        marginBottom: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    submitButton: {
        marginTop: 8,
        marginBottom: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: 8,
    },
});

export default withProviders(AuthStoreProvider)(AuthScreen);