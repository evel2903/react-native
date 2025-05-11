import React, { useEffect, useState, useCallback } from 'react'
import {
    View,
    StyleSheet,
    FlatList,
    RefreshControl,
    Dimensions,
} from 'react-native'
import {
    Appbar,
    ActivityIndicator,
    Text,
    Button,
    IconButton,
    Snackbar,
    Portal,
    Dialog,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { useStorageStore } from '../Stores/StorageStore/UseStorageStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { StorageStoreProvider } from '../Stores/StorageStore/StorageStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { StatusBar } from 'expo-status-bar'
import StorageListItem from '../Components/StorageListItem'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'
import { AuthStoreProvider } from '@/src/Auth/Presentation/Stores/AuthStore/AuthStoreProvider'

const StorageScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'Storage'>>()
    const storageStore = useStorageStore()
    const authStore = useAuthStore()
    const theme = useTheme()
    const [refreshing, setRefreshing] = useState(false)
    const windowHeight = Dimensions.get('window').height

    // Dialog states
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false)
    const [storageToDelete, setStorageToDelete] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Snackbar state
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')

    useEffect(() => {
        // Load storage data when component mounts
        storageStore.resetFilters()
    }, [])

    // Add useFocusEffect to refresh the list when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            storageStore.getStorageVouchers()
            return () => {}
        }, [storageStore])
    )

    const handleGoBack = () => {
        navigation.navigate('Home')
    }

    const handleToggleFilter = () => {
        // This would toggle filter visibility, but we're not implementing filters yet
        showSnackbar('Filter functionality coming soon')
    }

    const handleView = (id: string) => {
        navigation.navigate('StorageView', { id })
    }

    // Handle process action
    const handleProcess = async (id: string) => {
        showSnackbar('Handle process functionality coming soon')
    }

    // Helper method to show snackbar message
    const showSnackbar = (message: string) => {
        setSnackbarMessage(message)
        setSnackbarVisible(true)
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        storageStore.getStorageVouchers().finally(() => {
            setRefreshing(false)
        })
    }, [storageStore])

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.theme.colors.background },
            ]}
        >
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleGoBack} />
                    <Appbar.Content title="Storage" />
                    <Appbar.Action
                        icon="magnify"
                        onPress={handleToggleFilter}
                    />
                </Appbar.Header>

                {/* Storage Voucher List */}
                {storageStore.isLoading && !refreshing ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.loaderText}>
                            Loading storage vouchers...
                        </Text>
                    </View>
                ) : storageStore.count === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge">
                            No storage vouchers found
                        </Text>
                        <Button
                            mode="contained"
                            onPress={() => storageStore.resetFilters()}
                            style={styles.resetButton}
                        >
                            Reset Filters
                        </Button>
                    </View>
                ) : (
                    <FlatList
                        data={storageStore.results}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <StorageListItem
                                item={item}
                                onView={handleView}
                                onProcess={handleProcess}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[theme.theme.colors.primary]}
                            />
                        }
                    />
                )}

                {/* No confirmation dialogs needed for view-only functionality */}

                {/* Snackbar for messages */}
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={3000}
                    action={{
                        label: 'Dismiss',
                        onPress: () => setSnackbarVisible(false),
                    }}
                >
                    {snackbarMessage}
                </Snackbar>
            </SafeAreaView>
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    filterContainer: {
        zIndex: 2,
    },
    activeFiltersIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 4,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    listContent: {
        padding: 16,
        paddingBottom: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    resetButton: {
        marginTop: 16,
    },
})

export default withProviders(
    StorageStoreProvider,
    AuthStoreProvider
)(StorageScreen)
