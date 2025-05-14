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
import { usePickingStore } from '../Stores/PickingStore/UsePickingStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { PickingStoreProvider } from '../Stores/PickingStore/PickingStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { StatusBar } from 'expo-status-bar'
import PickingListItem from '../Components/PickingListItem'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'
import { AuthStoreProvider } from '@/src/Auth/Presentation/Stores/AuthStore/AuthStoreProvider'

const PickingScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'Picking'>>()
    const pickingStore = usePickingStore()
    const authStore = useAuthStore()
    const theme = useTheme()
    const [refreshing, setRefreshing] = useState(false)
    const windowHeight = Dimensions.get('window').height

    // Snackbar state
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')

    useEffect(() => {
        // Load picking data when component mounts
        pickingStore.resetFilters()
    }, [])

    // Add useFocusEffect to refresh the list when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            pickingStore.getPickingOrders()
            return () => {}
        }, [pickingStore])
    )

    const handleGoBack = () => {
        navigation.navigate('Home')
    }

    const handleToggleFilter = () => {
        // This would toggle filter visibility, but we're not implementing filters yet
        showSnackbar('Filter functionality coming soon')
    }

    const handleView = (id: string) => {
        showSnackbar('View functionality coming soon')
        //navigation.navigate('PickingView', { id })
    }

    // Handle process action
    const handleProcess = async (id: string) => {
        navigation.navigate('PickingProcess', { id })
    }

    // Helper method to show snackbar message
    const showSnackbar = (message: string) => {
        setSnackbarMessage(message)
        setSnackbarVisible(true)
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        pickingStore.getPickingOrders().finally(() => {
            setRefreshing(false)
        })
    }, [pickingStore])

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
                    <Appbar.Content title="Picking" />
                    <Appbar.Action
                        icon="magnify"
                        onPress={handleToggleFilter}
                    />
                </Appbar.Header>

                {/* Picking Order List */}
                {pickingStore.isLoading && !refreshing ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.loaderText}>
                            Loading picking orders...
                        </Text>
                    </View>
                ) : pickingStore.count === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge">No picking orders found</Text>
                        <Button
                            mode="contained"
                            onPress={() => pickingStore.resetFilters()}
                            style={styles.resetButton}
                        >
                            Reset Filters
                        </Button>
                    </View>
                ) : (
                    <FlatList
                        data={pickingStore.results}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <PickingListItem
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
    PickingStoreProvider,
    AuthStoreProvider
)(PickingScreen)
