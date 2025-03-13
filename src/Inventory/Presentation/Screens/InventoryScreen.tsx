// src/Inventory/Presentation/Screens/InventoryScreen.tsx
import React, { useEffect, useState } from 'react'
import { View, FlatList, StyleSheet, ScrollView } from 'react-native'
import {
    Appbar,
    Searchbar,
    ActivityIndicator,
    Text,
    Chip,
    Card,
    Button,
} from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { useInventoryStore } from '../Stores/InventoryStore/UseInventoryStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { InventoryStoreProvider } from '../Stores/InventoryStore/InventoryStoreProvider'
import { useI18n } from '@/src/Core/Presentation/Hooks/UseI18n'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { StatusBar } from 'expo-status-bar'
import InventoryRecordItem from '../Components/InventoryRecordItem'
import InventoryRecordEntity from '../../Domain/Entities/InventoryRecordEntity'

const InventoryScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'Inventory'>>()
    const inventoryStore = useInventoryStore()
    const theme = useTheme()
    const i18n = useI18n()

    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        // Load inventory data when component mounts
        inventoryStore.resetFilters() // Start with no filters applied
    }, [inventoryStore])

    const handleGoBack = () => {
        navigation.navigate('Home')
    }

    const handleSearch = () => {
        inventoryStore.search(searchQuery)
    }

    const handleClearSearch = () => {
        setSearchQuery('')
        inventoryStore.search('')
    }

    const handleProcess = (id: string) => {
        // Navigate to the process screen with the selected inventory ID
        navigation.navigate('InventoryProcess', { id })
    }

    const handleFilter = (value: string) => {
        if (value === 'all') {
            inventoryStore.filterByStatus(undefined)
        } else {
            inventoryStore.filterByStatus(value as any)
        }
    }

    return (
        <View
            style={{ flex: 1, backgroundColor: theme.theme.colors.background }}
        >
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView style={{ flex: 1 }} edges={['right', 'left']}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleGoBack} />
                    <Appbar.Content title="Inventory" />
                </Appbar.Header>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Searchbar
                        placeholder="Search inventory"
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        onSubmitEditing={handleSearch}
                        onClearIconPress={handleClearSearch}
                        style={styles.searchbar}
                    />
                </View>

                {/* Status Filter */}
                <View style={styles.filterArea}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScrollContent}
                        style={styles.filterContainer}
                    >
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'in-progress', label: 'In Progress' },
                            { value: 'completed', label: 'Completed' },
                            { value: 'cancelled', label: 'Cancelled' },
                        ].map(filter => (
                            <Chip
                                key={filter.value}
                                selected={
                                    (filter.value === 'all' &&
                                        !inventoryStore.filters.status) ||
                                    inventoryStore.filters.status === filter.value
                                }
                                onPress={() => handleFilter(filter.value)}
                                style={[
                                    styles.filterChip,
                                    (filter.value === 'all' &&
                                        !inventoryStore.filters.status) ||
                                    inventoryStore.filters.status === filter.value
                                        ? styles.activeFilterChip
                                        : styles.inactiveFilterChip,
                                ]}
                                showSelectedCheck={false}
                                mode="flat"
                                textStyle={[
                                    (filter.value === 'all' &&
                                        !inventoryStore.filters.status) ||
                                    inventoryStore.filters.status === filter.value
                                        ? styles.activeFilterText
                                        : styles.inactiveFilterText,
                                ]}
                            >
                                {filter.label}
                            </Chip>
                        ))}
                    </ScrollView>
                </View>

                {/* Inventory Records List */}
                {inventoryStore.isLoading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" />
                        <Text style={styles.loaderText}>
                            Loading inventory records...
                        </Text>
                    </View>
                ) : inventoryStore.isEmpty ? (
                    <View style={styles.emptyContainer}>
                        <Text variant="bodyLarge">
                            No inventory records found
                        </Text>
                        <Button
                            mode="contained"
                            onPress={() => inventoryStore.resetFilters()}
                            style={styles.resetButton}
                        >
                            Reset Filters
                        </Button>
                    </View>
                ) : (
                    <FlatList
                        data={inventoryStore.results}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <InventoryRecordItem
                                record={item}
                                onPress={handleProcess}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </SafeAreaView>
        </View>
    )
})

const styles = StyleSheet.create({
    searchContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    searchbar: {
        elevation: 0,
    },
    filterArea: {
        marginBottom: 16,
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 8,
    },
    filterContainer: {
        paddingVertical: 12,
    },
    filterScrollContent: {
        paddingHorizontal: this,
        paddingRight: 24,
        gap: 12,
    },
    filterChip: {
        height: 36,
        minWidth: 100,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterChipText: {
        textAlign: 'center',
    },
    activeFilterChip: {
        backgroundColor: '#5D3FD3',
    },
    inactiveFilterChip: {
        backgroundColor: '#EDE9FE',
    },
    activeFilterText: {
        color: 'white',
        fontWeight: '500',
    },
    inactiveFilterText: {
        color: '#4B5563',
    },
    listContent: {
        padding: 16,
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

export default withProviders(InventoryStoreProvider)(InventoryScreen)