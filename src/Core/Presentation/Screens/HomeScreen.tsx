import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
    Card,
    Text,
    Appbar,
    Avatar,
    Title,
    Paragraph,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { RootScreenNavigationProp } from '../Navigation/Types/Index'
import { useI18n } from '../Hooks/UseI18n'
import { StatusBar } from 'expo-status-bar'
import { observer } from 'mobx-react'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'
import { withProviders } from '../Utils/WithProviders'
import { AuthStoreProvider } from '@/src/Auth/Presentation/Stores/AuthStore/AuthStoreProvider'
import { useTheme } from '../Theme/ThemeProvider'

const HomeScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'Home'>>()
    const theme = useTheme()
    const i18n = useI18n()
    const authStore = useAuthStore()

    const handleLogout = async () => {
        await authStore.logout()
        navigation.replace('Auth')
    }

    const menuItems = [
        {
            title: 'Tracking',
            icon: 'map-marker',
            description: i18n.t('Tracking description'),
            onPress: () => navigation.navigate('Tracking'),
        },
        {
            title: i18n.t('home.menuItems.stockIn'),
            icon: 'arrow-collapse',
            description: i18n.t('home.menuItems.stockInDescription'),
            onPress: () => navigation.navigate('StockIn'),
        },
        {
            title: 'Storage',
            icon: 'warehouse', // Using a suitable icon for storage
            description: 'Manage inventory and storage locations',
            onPress: () => navigation.navigate('Storage'),
        },
        {
            title: 'Picking',
            icon: 'cart', // Using a suitable icon for picking
            description: 'Manage picking operations',
            onPress: () => navigation.navigate('Picking'),
        },
        {
            title: 'Stock Out',
            icon: 'arrow-expand',
            description: i18n.t('home.menuItems.stockOutDescription'),
            onPress: () => navigation.navigate('StockOut'),
        },
    ]

    return (
        <View
            style={{ flex: 1, backgroundColor: theme.theme.colors.background }}
        >
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView style={{ flex: 1 }} edges={['right', 'left']}>
                <Appbar.Header>
                    <Appbar.Content title={i18n.t('home.title')} />
                    <Appbar.Action icon="logout" onPress={handleLogout} />
                </Appbar.Header>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* User welcome section */}
                    <Card style={styles.welcomeCard}>
                        <Card.Content style={styles.welcomeCardContent}>
                            <View style={styles.welcomeTextContainer}>
                                {authStore.user?.name ? (
                                    <Title>
                                        {i18n.t('home.welcome', {
                                            name: authStore.user.name,
                                        })}
                                    </Title>
                                ) : (
                                    <Title>
                                        {i18n.t('home.welcomeDefault')}
                                    </Title>
                                )}
                                <Paragraph>
                                    {i18n.t('home.welcomeDescription')}
                                </Paragraph>
                            </View>
                            {authStore.user?.avatar && (
                                <Avatar.Image
                                    size={60}
                                    source={{ uri: authStore.user.avatar }}
                                />
                            )}
                        </Card.Content>
                    </Card>

                    {/* Menu items */}
                    <Text variant="titleLarge" style={styles.menuTitle}>
                        {i18n.t('home.menu')}
                    </Text>

                    <View style={styles.menuContainer}>
                        {menuItems.map((item, index) => (
                            <Card
                                key={index}
                                style={styles.menuCard}
                                onPress={item.onPress}
                            >
                                <Card.Content style={styles.menuCardContent}>
                                    <Avatar.Icon
                                        size={48}
                                        icon={item.icon}
                                        style={styles.menuIcon}
                                    />
                                    <View style={styles.menuTextContainer}>
                                        <Text variant="titleMedium">
                                            {item.title}
                                        </Text>
                                        <Text variant="bodySmall">
                                            {item.description}
                                        </Text>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
})

const styles = StyleSheet.create({
    scrollContent: {
        padding: 16,
    },
    welcomeCard: {
        marginBottom: 24,
    },
    welcomeCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    menuTitle: {
        marginBottom: 16,
        fontWeight: 'bold',
    },
    menuContainer: {
        gap: 8,
    },
    menuCard: {
        marginBottom: 4,
    },
    menuCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 16,
    },
    menuTextContainer: {
        flex: 1,
    },
})

export default withProviders(AuthStoreProvider)(HomeScreen)
