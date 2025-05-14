import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native'
import {
    Appbar,
    Text,
    Snackbar,
    Surface,
    ActivityIndicator,
    Chip,
    ProgressBar,
    List,
    Divider,
    TouchableRipple,
} from 'react-native-paper'
import { formatDate } from '@/src/Core/Utils'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import {
    RootScreenNavigationProp,
    RootStackParamList,
} from '@/src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { usePickingStore } from '../Stores/PickingStore/UsePickingStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { PickingStoreProvider } from '../Stores/PickingStore/PickingStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { Status, getStatusDisplayName } from '@/src/Common/Domain/Enums/Status'
import {
    PRIORITY,
    getPriorityDisplayName,
    getPriorityColor,
} from '@/src/Common/Domain/Enums/Priority'
import CenteredAccordion from '../Components/CenteredAccordion'
import { PickingOrderProcessItemEntity } from '@/src/Picking/Domain/Entities/PickingOrderProcessEntity'
import { GroupedPickingItems } from '../Components/types'

type PickingViewScreenRouteProp = RouteProp<
    RootStackParamList,
    'PickingView'
>

// Location Accordion Component
const LocationAccordion = ({ location }: { location: GroupedPickingItems }) => {
    const [expanded, setExpanded] = useState(false)

    // Progress color logic
    const getProgressColor = (progress: number) => {
        if (progress === 0) return '#f44336' // Red for not started
        if (progress < 1) return '#ff9800' // Orange for in progress
        return '#4caf50' // Green for complete
    }

    // Calculate total quantities for this location
    const totalToPick = location.items.reduce((sum, item) => sum + Math.min(item.requestedQuantity, item.quantityCanPicked), 0)
    const totalPicked = location.items.reduce((sum, item) => {
        const pickedQty = item.updatedQuantityPicked !== undefined 
            ? item.updatedQuantityPicked 
            : item.quantityPicked
        return sum + Math.min(pickedQty, Math.min(item.requestedQuantity, item.quantityCanPicked))
    }, 0)
    
    // Calculate progress percentage for display
    const progressPercentage = Math.round(location.progress * 100)

    return (
        <Surface style={styles.locationCard} elevation={1}>
            {/* Location Header - Always visible */}
            <TouchableRipple onPress={() => setExpanded(!expanded)}>
                <View>
                    <View style={styles.locationCardHeader}>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationName}>
                                {location.warehouseName} - {location.shelfName}
                            </Text>
                            <Text style={styles.locationSubtext}>
                                {location.areaName}, Row {location.rowName}
                            </Text>
                        </View>
                        <List.Icon
                            icon={expanded ? 'chevron-up' : 'chevron-down'}
                            style={styles.accordionIcon}
                        />
                    </View>

                    <View style={styles.locationSummary}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.summaryText}>
                                {location.items.length} product{location.items.length !== 1 ? 's' : ''}
                            </Text>
                            <Text
                                style={[
                                    styles.percentageText,
                                    { color: getProgressColor(location.progress) },
                                ]}
                            >
                                {progressPercentage}%
                            </Text>
                        </View>
                        <ProgressBar
                            progress={location.progress}
                            color={getProgressColor(location.progress)}
                            style={styles.summaryProgressBar}
                        />
                        <Text style={styles.quantityText}>
                            {totalPicked} of {totalToPick} items picked
                        </Text>
                    </View>
                </View>
            </TouchableRipple>

            {/* Expanded content - Products list */}
            {expanded && (
                <View style={styles.productList}>
                    <Divider style={styles.divider} />
                    <Text style={styles.productsHeader}>Products</Text>
                    
                    {location.items.map((item, index) => (
                        <View key={item.id} style={styles.productItem}>
                            <Text style={styles.productName}>{item.goodsName || 'Unknown Product'}</Text>
                            <Text style={styles.productCode}>Code: {item.goodsCode || 'N/A'}</Text>
                            
                            {/* Product quantities */}
                            <View style={styles.quantityContainer}>
                                <View style={styles.quantityRow}>
                                    <Text style={styles.quantityLabel}>Requested:</Text>
                                    <Text style={styles.quantityValue}>{item.requestedQuantity}</Text>
                                </View>
                                <View style={styles.quantityRow}>
                                    <Text style={styles.quantityLabel}>Available:</Text>
                                    <Text style={styles.quantityValue}>{item.quantityCanPicked}</Text>
                                </View>
                                <View style={styles.quantityRow}>
                                    <Text style={styles.quantityLabel}>Picked:</Text>
                                    <Text style={[
                                        styles.quantityValue,
                                        styles.pickedQuantity
                                    ]}>
                                        {item.updatedQuantityPicked !== undefined 
                                            ? item.updatedQuantityPicked 
                                            : item.quantityPicked}
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Product progress bar */}
                            <View style={styles.productProgressContainer}>
                                <ProgressBar
                                    progress={Math.min(
                                        (item.updatedQuantityPicked !== undefined 
                                            ? item.updatedQuantityPicked 
                                            : item.quantityPicked) / 
                                        Math.min(item.requestedQuantity, item.quantityCanPicked),
                                        1
                                    )}
                                    color={getProgressColor(
                                        Math.min(
                                            (item.updatedQuantityPicked !== undefined 
                                                ? item.updatedQuantityPicked 
                                                : item.quantityPicked) / 
                                            Math.min(item.requestedQuantity, item.quantityCanPicked),
                                            1
                                        )
                                    )}
                                    style={styles.productProgressBar}
                                />
                            </View>
                            
                            {index < location.items.length - 1 && (
                                <Divider style={styles.productDivider} />
                            )}
                        </View>
                    ))}
                </View>
            )}
        </Surface>
    )
}

const PickingViewScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'Picking'>>()
    const route = useRoute<PickingViewScreenRouteProp>()
    const pickingStore = usePickingStore()
    const theme = useTheme()

    // Get picking ID from route params
    const pickingId = route.params?.id

    // States
    const [infoExpanded, setInfoExpanded] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [groupedLocations, setGroupedLocations] = useState<GroupedPickingItems[]>([])

    // Fetch picking data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Load picking order details
                if (pickingId) {
                    const success = await pickingStore.getPickingOrderDetails(
                        pickingId
                    )
                    if (!success) {
                        showSnackbar('Failed to load picking order details')
                    }

                    // Load picking order process
                    const processSuccess =
                        await pickingStore.getPickingOrderProcess(pickingId)
                    if (!processSuccess) {
                        showSnackbar('Failed to load picking order process')
                    }
                } else {
                    showSnackbar('No picking order ID provided')
                }
            } catch (error) {
                console.error('Error loading data:', error)
                showSnackbar('Error loading required data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [pickingId])

    // Group items by location for display
    useEffect(() => {
        if (pickingStore.processItems && pickingStore.processItems.length > 0) {
            groupItemsByLocation(pickingStore.processItems)
        }
    }, [pickingStore.processItems])

    // Group items by location
    const groupItemsByLocation = (items: PickingOrderProcessItemEntity[]) => {
        const locationMap = new Map<string, GroupedPickingItems>()

        items.forEach(item => {
            // Create a unique key for this location
            const locationKey = `${item.warehouseId || ''}-${
                item.areaId || ''
            }-${item.rowId || ''}-${item.shelfId || ''}-${item.level}-${
                item.position
            }`

            if (!locationMap.has(locationKey)) {
                locationMap.set(locationKey, {
                    warehouseName: item.warehouseName,
                    areaName: item.areaName,
                    rowName: item.rowName,
                    shelfName: item.shelfName,
                    level: item.level,
                    position: item.position,
                    locationKey,
                    items: [],
                    progress: 0,
                })
            }

            // Add item to this location group
            const location = locationMap.get(locationKey)
            if (location) {
                location.items.push(item)
            }
        })

        // Calculate progress for each location
        locationMap.forEach(location => {
            let totalRequested = 0
            let totalPicked = 0

            location.items.forEach(item => {
                const maxPickable = Math.min(
                    item.requestedQuantity,
                    item.quantityCanPicked
                )
                totalRequested += maxPickable

                const pickedQuantity = item.updatedQuantityPicked !== undefined
                    ? item.updatedQuantityPicked
                    : item.quantityPicked
                
                totalPicked += Math.min(pickedQuantity, maxPickable)
            })

            location.progress =
                totalRequested > 0 ? totalPicked / totalRequested : 0
        })

        // Convert map to array and sort by warehouse and shelf name
        const groupedLocations = Array.from(locationMap.values()).sort(
            (a, b) => {
                if (a.warehouseName !== b.warehouseName) {
                    return a.warehouseName.localeCompare(b.warehouseName)
                }
                if (a.areaName !== b.areaName) {
                    return a.areaName.localeCompare(b.areaName)
                }
                if (a.rowName !== b.rowName) {
                    return a.rowName.localeCompare(b.rowName)
                }
                return a.shelfName.localeCompare(b.shelfName)
            }
        )

        setGroupedLocations(groupedLocations)
    }

    const handleGoBack = () => {
        navigation.goBack()
    }

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message)
        setSnackbarVisible(true)
    }

    // Get progress color based on completion percentage
    const getProgressColor = (percentage: number) => {
        if (percentage === 0) return '#f44336' // Red for not started
        if (percentage < 0.5) return '#ff9800' // Orange for < 50%
        if (percentage < 1) return '#2196f3' // Blue for partial completion
        return '#4caf50' // Green for complete
    }

    // Get background color based on priority
    const getAccordionBackgroundColor = () => {
        const pickingData = pickingStore.selectedPickingOrder
        if (!pickingData) return '#e8f5e9' // Default light green

        switch (pickingData.priority) {
            case PRIORITY.High:
                return '#ffebee' // Light red
            case PRIORITY.Medium:
                return '#fff3e0' // Light orange
            case PRIORITY.Low:
                return '#e8f5e9' // Light green
            default:
                return '#e8f5e9' // Default light green
        }
    }

    // Render the form content inside the accordion
    const renderFormContent = () => {
        const pickingData = pickingStore.selectedPickingOrder

        if (!pickingData) return null

        return (
            <>
                {/* Code Section with Priority Chip */}
                <View style={styles.codeSection}>
                    <View style={styles.codeContainer}>
                        <View>
                            <Text style={styles.labelText}>Code</Text>
                            <Text style={styles.valueText}>
                                {pickingData.code || '-'}
                            </Text>
                        </View>
                        <View style={styles.priorityChipWrapper}>
                            <Chip
                                style={{
                                    backgroundColor: getPriorityColor(
                                        pickingData.priority as any
                                    ),
                                }}
                                textStyle={styles.priorityChipText}
                            >
                                {getPriorityDisplayName(
                                    pickingData.priority as any
                                )}
                            </Chip>
                        </View>
                    </View>
                </View>

                {/* Picking Date and Status Row */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Picking Date</Text>
                        <Text style={styles.valueText}>
                            {pickingData.pickingDate
                                ? formatDate(pickingData.pickingDate)
                                : '-'}
                        </Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Status</Text>
                        <Text style={styles.valueText}>
                            {getStatusDisplayName(pickingData.status as Status)}
                        </Text>
                    </View>
                </View>

                {/* Created by and Assigned to Row */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Created By</Text>
                        <Text style={styles.valueText}>
                            {pickingData.createdByUser || '-'}
                        </Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Assigned To</Text>
                        <Text style={styles.valueText}>
                            {pickingData.assignedUser || '-'}
                        </Text>
                    </View>
                </View>

                {/* Requester Information */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Requester</Text>
                        <Text style={styles.valueText}>
                            {pickingData.requester || '-'}
                        </Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Phone Number</Text>
                        <Text style={styles.valueText}>
                            {pickingData.requesterPhoneNumber || '-'}
                        </Text>
                    </View>
                </View>

                {/* Notes Section */}
                {pickingData.note && (
                    <View style={styles.infoSection}>
                        <Text style={styles.labelText}>Notes</Text>
                        <Text style={styles.notesText}>{pickingData.note}</Text>
                    </View>
                )}

                {/* Completion Date */}
                {pickingData.completedAt && (
                    <View style={styles.infoSection}>
                        <Text style={styles.labelText}>Completed At</Text>
                        <Text style={styles.valueText}>
                            {formatDate(pickingData.completedAt)}
                        </Text>
                    </View>
                )}

                {/* Overall Progress Section */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>
                            Completion Status
                        </Text>
                        <Text style={styles.progressPercentage}>
                            {Math.round(pickingStore.processProgress * 100)}%
                        </Text>
                    </View>
                    <ProgressBar
                        progress={pickingStore.processProgress}
                        color={getProgressColor(pickingStore.processProgress)}
                        style={styles.progressBar}
                    />
                </View>
            </>
        )
    }

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.theme.colors.background },
            ]}
        >
            <StatusBar style={theme.isDarkTheme ? 'light' : 'dark'} />
            <SafeAreaView style={{ flex: 1 }} edges={['right', 'left']}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={handleGoBack} />
                    <Appbar.Content title="View Picking Order" />
                </Appbar.Header>

                {isLoading || !pickingStore.selectedPickingOrder ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={theme.theme.colors.primary}
                        />
                        <Text style={styles.loadingText}>
                            Loading picking order details...
                        </Text>
                    </View>
                ) : (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView style={styles.scrollView}>
                            {/* Accordion for form info section */}
                            <Surface
                                style={[
                                    styles.accordionContainer,
                                    {
                                        backgroundColor:
                                            getAccordionBackgroundColor(),
                                    },
                                ]}
                                elevation={1}
                            >
                                <CenteredAccordion
                                    title="Picking Order Information"
                                    expanded={infoExpanded}
                                    onPress={() =>
                                        setInfoExpanded(!infoExpanded)
                                    }
                                >
                                    <View style={styles.formContent}>
                                        {renderFormContent()}
                                    </View>
                                </CenteredAccordion>
                            </Surface>

                            {/* Locations Section Header */}
                            <View style={styles.itemsListHeader}>
                                <Text style={styles.itemsListTitle}>
                                    Picking Locations ({groupedLocations.length} locations)
                                </Text>
                            </View>

                            {/* Location Accordions */}
                            {groupedLocations.length === 0 ? (
                                <Text style={styles.emptyListText}>
                                    No items to pick in this order.
                                </Text>
                            ) : (
                                groupedLocations.map(location => (
                                    <LocationAccordion 
                                        key={location.locationKey} 
                                        location={location} 
                                    />
                                ))
                            )}

                            {/* Bottom padding */}
                            <View style={styles.bottomPadding} />
                        </ScrollView>
                    </TouchableWithoutFeedback>
                )}

                {/* Snackbar for messages */}
                <Snackbar
                    visible={snackbarVisible}
                    onDismiss={() => setSnackbarVisible(false)}
                    duration={2000}
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
    scrollView: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
    },
    // Accordion styles
    accordionContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
    },
    formContent: {
        padding: 12,
        backgroundColor: '#ffffff', // White background for the expanded content
    },
    // Code section with priority chip
    codeSection: {
        marginBottom: 16,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    priorityChipWrapper: {
        marginLeft: 12,
        alignSelf: 'center',
    },
    priorityChipText: {
        color: 'white',
        fontSize: 11,
        textAlign: 'center',
        lineHeight: 15,
    },
    // Form information styles
    infoSection: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 16,
    },
    infoColumn: {
        flex: 1,
    },
    labelText: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 4,
    },
    valueText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    notesText: {
        fontSize: 14,
        color: '#333',
        marginTop: 4,
        lineHeight: 20,
    },
    // Progress section styles
    progressSection: {
        marginTop: 4,
        marginBottom: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        padding: 0,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    progressLabel: {
        fontSize: 12,
        color: '#757575',
    },
    progressPercentage: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    // Items list styles
    itemsListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemsListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bottomPadding: {
        height: 40,
    },
    emptyListText: {
        textAlign: 'center',
        marginVertical: 20,
        color: '#666',
    },
    // Location card styles
    locationCard: {
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    locationCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: 12,
    },
    locationInfo: {
        flex: 1,
    },
    locationName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationSubtext: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    locationPosition: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    locationSummary: {
        marginHorizontal: 12,
        marginBottom: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    summaryText: {
        fontSize: 14,
    },
    percentageText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    summaryProgressBar: {
        height: 6,
        borderRadius: 3,
    },
    quantityText: {
        fontSize: 12,
        color: '#666',
        marginTop: 6,
        textAlign: 'right',
    },
    accordionIcon: {
        margin: 0,
    },
    // Product list styles
    productList: {
        padding: 12,
        paddingTop: 0,
    },
    divider: {
        marginBottom: 8,
    },
    productsHeader: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    productItem: {
        marginBottom: 8,
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    productCode: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    quantityContainer: {
        marginTop: 4,
        backgroundColor: '#f5f5f5',
        padding: 8,
        borderRadius: 4,
    },
    quantityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    quantityLabel: {
        fontSize: 12,
        color: '#666',
    },
    quantityValue: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    pickedQuantity: {
        color: '#2196f3',
    },
    productProgressContainer: {
        marginTop: 6,
    },
    productProgressBar: {
        height: 4,
        borderRadius: 2,
    },
    productDivider: {
        marginTop: 8,
        marginBottom: 8,
    },
})

export default withProviders(PickingStoreProvider)(PickingViewScreen)