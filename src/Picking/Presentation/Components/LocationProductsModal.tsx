import React, { useEffect, useState, useMemo } from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {
    Text,
    Divider,
    Button,
    Portal,
    Modal,
    IconButton,
    ProgressBar,
    TextInput,
} from 'react-native-paper'
import { PickingOrderProcessItemEntity } from '@/src/Picking/Domain/Entities/PickingOrderProcessEntity'
import { GroupedPickingItems, LocationDetails } from './types'
import ProductItem from './ProductItem'
import ProductScannerModal from './ProductScannerModal'

// Component for displaying location details
const LocationDetailsView: React.FC<LocationDetails> = ({
    warehouseName,
    areaName,
    rowName,
    shelfName,
    level,
    position,
}) => (
    <View style={styles.locationDetails}>
        <Text style={styles.locationText}>Warehouse: {warehouseName}</Text>
        <Text style={styles.locationText}>Area: {areaName}</Text>
        <Text style={styles.locationText}>Row: {rowName}</Text>
        <Text style={styles.locationText}>Shelf: {shelfName}</Text>
        <Text style={styles.locationText}>
            Level: {level} Position: {position}
        </Text>
    </View>
)

interface LocationProductsModalProps {
    visible: boolean
    onClose: () => void
    location: GroupedPickingItems
    onUpdateQuantity: (itemId: string, quantity: number) => Promise<boolean>
    pendingUpdates: Map<string, number>
}

const LocationProductsModal: React.FC<LocationProductsModalProps> = ({
    visible,
    onClose,
    location,
    onUpdateQuantity,
    pendingUpdates,
}) => {
    // Track temporarily edited values before submitting
    const [inputValues, setInputValues] = useState<Map<string, string>>(
        new Map()
    )

    // Track successful updates for immediate UI feedback
    const [localUpdates, setLocalUpdates] = useState<Map<string, number>>(
        new Map()
    )

    // Search functionality
    const [searchQuery, setSearchQuery] = useState('')
    const [scannerModalVisible, setScannerModalVisible] = useState(false)

    // Calculate overall location progress
    const locationProgress = useMemo(() => {
        if (!location || !location.items || location.items.length === 0) {
            return 0
        }

        let totalRequested = 0
        let totalPicked = 0

        location.items.forEach(item => {
            const maxPickable = Math.min(
                item.requestedQuantity,
                item.quantityCanPicked
            )
            totalRequested += maxPickable

            // First check local updates from this session
            let pickedQuantity = item.quantityPicked

            // Check if we have a local update from this session
            if (localUpdates.has(item.id)) {
                pickedQuantity = localUpdates.get(item.id)!
            }
            // Otherwise check for pending updates from store
            else if (pendingUpdates.has(item.id)) {
                pickedQuantity = pendingUpdates.get(item.id)!
            }
            // Then check for already updated quantity in the item
            else if (item.updatedQuantityPicked !== undefined) {
                pickedQuantity = item.updatedQuantityPicked
            }

            totalPicked += Math.min(pickedQuantity, maxPickable)
        })

        return totalRequested > 0 ? totalPicked / totalRequested : 0
    }, [location, pendingUpdates, localUpdates])

    // Filter items based on search query
    const filteredItems = useMemo(() => {
        if (!location || !location.items) return []

        if (!searchQuery.trim()) return location.items

        const normalizedQuery = searchQuery.toLowerCase().trim()
        return location.items.filter(
            item =>
                // Search by goods name
                (item.goodsName &&
                    item.goodsName.toLowerCase().includes(normalizedQuery)) ||
                // Search by goods code
                (item.goodsCode &&
                    item.goodsCode.toLowerCase().includes(normalizedQuery))
        )
    }, [location?.items, searchQuery])

    // Progress color determination
    const getProgressColor = (progress: number) => {
        if (progress === 0) return '#f44336' // Red for not started
        if (progress < 1) return '#ff9800' // Orange for in progress
        return '#4caf50' // Green for complete
    }

    // Get current quantity to display - account for all possible states
    const getCurrentQuantity = (item: PickingOrderProcessItemEntity) => {
        // First check for local updates from this session
        if (localUpdates.has(item.id)) {
            return localUpdates.get(item.id)!
        }

        // Then check for pending updates from store
        const pendingQuantity = pendingUpdates.get(item.id)
        if (pendingQuantity !== undefined) {
            return pendingQuantity
        }

        // Then check if there's an updated quantity in the item
        if (item.updatedQuantityPicked !== undefined) {
            return item.updatedQuantityPicked
        }

        // Fall back to the original quantity
        return item.quantityPicked
    }

    // Handle input change for a specific item
    const handleInputChange = (id: string, value: string) => {
        const newInputValues = new Map(inputValues)
        newInputValues.set(id, value)
        setInputValues(newInputValues)
    }

    // Handle update button click (to be passed to ProductItem)
    const handleUpdate = async (
        itemId: string,
        quantity: number
    ): Promise<boolean> => {
        try {
            console.log(
                `LocationProductsModal: Updating item ${itemId} to quantity ${quantity}`
            )
            const result = await onUpdateQuantity(itemId, quantity)
            console.log(`LocationProductsModal: Result from parent: ${result}`)

            if (result) {
                // Update input value on success
                const newInputValues = new Map(inputValues)
                newInputValues.set(itemId, quantity.toString())
                setInputValues(newInputValues)

                // Store successful update for immediate UI feedback
                const newLocalUpdates = new Map(localUpdates)
                newLocalUpdates.set(itemId, quantity)
                setLocalUpdates(newLocalUpdates)
            }

            return result // Make sure we explicitly return the result
        } catch (error) {
            console.error('Error in LocationProductsModal.handleUpdate:', error)
            return false
        }
    }

    // Handle scanner button click
    const handleOpenScanner = () => {
        setScannerModalVisible(true)
    }

    // Handle code scanned
    const handleCodeScanned = (code: string) => {
        try {
            const parsedData = JSON.parse(code)
            if (parsedData && typeof parsedData === 'object') {
                // If it contains a code property, use it for search
                if ('code' in parsedData) {
                    setSearchQuery(parsedData.code || '')
                } else {
                    // If no code property, use the raw string
                    setSearchQuery(code)
                }
            } else {
                // If not valid JSON object, use the raw string
                setSearchQuery(code)
            }
        } catch (error) {
            // If not valid JSON, use the raw string
            setSearchQuery(code)
        }

        setScannerModalVisible(false)
    }

    // Synchronize input values when item props change
    useEffect(() => {
        // Update input values if the item's quantity has changed externally
        if (location && location.items) {
            location.items.forEach(item => {
                const currentQuantity = getCurrentQuantity(item)
                // Only update if we don't have a pending edit
                if (!inputValues.has(item.id)) {
                    const newInputValues = new Map(inputValues)
                    newInputValues.set(item.id, currentQuantity.toString())
                    setInputValues(newInputValues)
                }
            })
        }
    }, [location?.items, pendingUpdates]) // Added pendingUpdates dependency

    // Reset local updates when location changes
    useEffect(() => {
        if (location) {
            setLocalUpdates(new Map())
            setSearchQuery('') // Clear search when location changes
        }
    }, [location?.locationKey])

    // Get input value for an item
    const getInputValue = (itemId: string) => {
        const foundItem = location.items.find(i => i.id === itemId)

        // If the item doesn't exist, return "0"
        if (!foundItem) return '0'

        // If we have a stored input value, use it
        if (inputValues.has(itemId)) {
            return inputValues.get(itemId)!
        }

        // Otherwise calculate the current quantity based on all possible states
        return getCurrentQuantity(foundItem).toString()
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={styles.modalContainer}
            >
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Picking Products</Text>
                    <IconButton icon="close" size={20} onPress={onClose} />
                </View>

                <Divider />

                {/* Overall Location Progress */}
                <View style={styles.overallProgressContainer}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>
                            Location Progress
                        </Text>
                        <Text style={styles.progressPercentage}>
                            {Math.round(locationProgress * 100)}%
                        </Text>
                    </View>
                    <ProgressBar
                        progress={locationProgress}
                        color={getProgressColor(locationProgress)}
                        style={styles.overallProgressBar}
                    />
                </View>

                {/* Search section */}
                <View style={styles.searchSection}>
                    <View style={styles.searchInputContainer}>
                        <TextInput
                            dense
                            mode="outlined"
                            placeholder="Search goods"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                            clearButtonMode="while-editing"
                            right={
                                searchQuery ? (
                                    <TextInput.Icon
                                        icon="magnify"
                                        onPress={() => setSearchQuery('')}
                                    />
                                ) : undefined
                            }
                        />
                        <Button
                            mode="outlined"
                            icon="barcode-scan"
                            onPress={handleOpenScanner}
                            style={styles.scanButton}
                        >
                            Scan
                        </Button>
                    </View>
                    {searchQuery.trim() !== '' && (
                        <View style={styles.searchResultsInfo}>
                            <Text style={styles.searchResultsText}>
                                {filteredItems.length}{' '}
                                {filteredItems.length === 1
                                    ? 'product'
                                    : 'products'}{' '}
                                found
                            </Text>
                        </View>
                    )}
                </View>

                <ScrollView style={styles.modalContent}>
                    {/* Location Details */}
                    <LocationDetailsView
                        warehouseName={location?.warehouseName || ''}
                        areaName={location?.areaName || ''}
                        rowName={location?.rowName || ''}
                        shelfName={location?.shelfName || ''}
                        level={location?.level || 0}
                        position={location?.position || 0}
                    />

                    <Divider style={styles.divider} />

                    {/* Items in this location */}
                    {filteredItems.length === 0 ? (
                        <Text style={styles.emptyResultsText}>
                            {searchQuery.trim() !== ''
                                ? 'No products match your search criteria'
                                : 'No products available in this location'}
                        </Text>
                    ) : (
                        filteredItems.map((item, index) => (
                            <ProductItem
                                key={item.id}
                                item={item}
                                index={index}
                                onUpdateQuantity={handleUpdate}
                                isPendingUpdate={pendingUpdates.has(item.id)}
                                inputValue={getInputValue(item.id)}
                                onInputChange={value =>
                                    handleInputChange(item.id, value)
                                }
                            />
                        ))
                    )}
                </ScrollView>

                <Divider />

                <View style={styles.modalFooter}>
                    <Button mode="outlined" onPress={onClose}>
                        Close
                    </Button>
                </View>

                {/* Show the scanner modal when needed */}
                {scannerModalVisible && (
                    <ProductScannerModal
                        visible={scannerModalVisible}
                        onClose={() => setScannerModalVisible(false)}
                        onCodeScanned={handleCodeScanned}
                    />
                )}
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    // Modal styles
    modalContainer: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 8,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 16,
        maxHeight: '80%',
    },
    modalFooter: {
        padding: 16,
        alignItems: 'flex-end',
    },

    // Location details styles
    locationDetails: {
        padding: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 4,
        marginBottom: 12,
    },
    locationText: {
        fontSize: 14,
        marginBottom: 2,
    },

    divider: {
        marginVertical: 12,
    },

    // Progress bar styles
    overallProgressContainer: {
        padding: 16,
        paddingBottom: 0,
        backgroundColor: 'white',
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    overallProgressBar: {
        height: 8,
        borderRadius: 4,
        marginBottom: 12,
    },

    // Search section styles
    searchSection: {
        padding: 16,
        paddingTop: 8,
        paddingBottom: 0,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchInput: {
        flex: 1,
    },
    scanButton: {
        paddingVertical: 6,
        borderRadius: 4,
    },
    searchResultsInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
        marginBottom: 0,
    },
    searchResultsText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    emptyResultsText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
        fontStyle: 'italic',
    },
})

export default LocationProductsModal
