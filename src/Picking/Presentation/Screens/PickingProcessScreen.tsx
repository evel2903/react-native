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
    Button,
    Text,
    Snackbar,
    Surface,
    ActivityIndicator,
    Chip,
    Portal,
    Dialog,
    TextInput,
    ProgressBar,
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
import ProductScannerModal from '../Components/ProductScannerModal'
import PickingLocationManager from '../Components/PickingLocationManager'

type PickingProcessScreenRouteProp = RouteProp<
    RootStackParamList,
    'PickingProcess'
>

const PickingProcessScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'Picking'>>()
    const route = useRoute<PickingProcessScreenRouteProp>()
    const pickingStore = usePickingStore()
    const theme = useTheme()

    // Get picking ID from route params
    const pickingId = route.params?.id

    // States
    const [infoExpanded, setInfoExpanded] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Scanner modal state
    const [scannerModalVisible, setScannerModalVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredItems, setFilteredItems] = useState<any[]>([])

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

    const handleGoBack = () => {
        navigation.goBack()
    }

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message)
        setSnackbarVisible(true)
    }

    const handleCompleteProcess = async () => {
        setIsProcessing(true)
        try {
            if (pickingId) {
                const emailResult =
                    await pickingStore.sendProcessCompletedEmail(pickingId)

                if (emailResult && emailResult.statusCode === 200) {
                    showSnackbar(
                        emailResult.message ||
                            'Process completed and email notification sent successfully'
                    )
                } else {
                    showSnackbar(
                        'Process completed successfully, but failed to send email notification'
                    )
                }

                // Navigate back to picking list after successful processing
                setTimeout(() => {
                    navigation.navigate('Picking')
                }, 1500)
            }
        } catch (error) {
            console.error('Error processing picking order:', error)
            showSnackbar('Error processing picking order')
        } finally {
            setIsProcessing(false)
            setConfirmDialogVisible(false)
        }
    }

    const handleUpdateQuantity = async (
        itemId: string,
        quantity: number
    ): Promise<boolean> => {
        try {
            console.log(
                `PickingProcessScreen: Updating item ${itemId} to quantity ${quantity}`
            )
            const result = await pickingStore.updateProcessItemPickedQuantity(
                itemId,
                quantity
            )
            console.log(`PickingProcessScreen: Store result: ${result}`)
            return result // Make sure we explicitly return the result
        } catch (error) {
            console.error(
                'Error in PickingProcessScreen.handleUpdateQuantity:',
                error
            )
            return false
        }
    }

    const handleOpenScanner = () => {
        setScannerModalVisible(true)
    }

    const handleCloseScanner = () => {
        setScannerModalVisible(false)
    }

    const handleCodeScanned = (code: string) => {
        // Try to parse the scanned code as JSON
        try {
            const parsedData = JSON.parse(code)
            if (parsedData && typeof parsedData === 'object') {
                // If it contains a code property, use it for search
                if ('code' in parsedData) {
                    setSearchQuery(parsedData.name || '')
                    showSnackbar(
                        `Location found: ${parsedData.name || 'Unknown'}`
                    )
                } else {
                    // If no code property, use the raw string
                    setSearchQuery(code)
                    showSnackbar('Location code scanned')
                }
            } else {
                // If not valid JSON object, use the raw string
                setSearchQuery(code)
                showSnackbar('Location code scanned')
            }
        } catch (error) {
            // If not valid JSON, use the raw string
            setSearchQuery(code)
            showSnackbar('Location code scanned')
        }

        setScannerModalVisible(false)
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

    // Get the process items array safely
    const getProcessItems = () => {
        if (!pickingStore.processItems) return []
        return pickingStore.processItems
    }

    // Filter items based on search query
    useEffect(() => {
        const items = getProcessItems()
        if (searchQuery.trim() === '') {
            setFilteredItems(items)
            return
        }

        const normalizedQuery = searchQuery.toLowerCase().trim()
        const filtered = items.filter(
            item =>
                // Filter by warehouse, area, row, shelf names
                (item.warehouseName &&
                    item.warehouseName
                        .toLowerCase()
                        .includes(normalizedQuery)) ||
                (item.areaName &&
                    item.areaName.toLowerCase().includes(normalizedQuery)) ||
                (item.rowName &&
                    item.rowName.toLowerCase().includes(normalizedQuery)) ||
                (item.shelfName &&
                    item.shelfName.toLowerCase().includes(normalizedQuery))
        )

        setFilteredItems(filtered)
    }, [searchQuery, pickingStore.processItems])

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
                    <Appbar.Content title="Process Picking Order" />
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

                            {/* Location Search Section */}
                            <View style={styles.searchSection}>
                                <View style={styles.searchBarContainer}>
                                    <View style={styles.searchInputWrapper}>
                                        <TextInput
                                            dense
                                            mode="outlined"
                                            placeholder="Search locations"
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                            right={
                                                <TextInput.Icon
                                                    icon="magnify"
                                                    onPress={() => {
                                                        // This is intentionally blank as search happens on change
                                                        // But we provide the icon for visual consistency
                                                    }}
                                                />
                                            }
                                            style={styles.searchInput}
                                            returnKeyType="search"
                                            clearButtonMode="while-editing"
                                        />
                                    </View>
                                    <Button
                                        mode="outlined"
                                        icon="qrcode-scan"
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
                                                ? 'result'
                                                : 'results'}{' '}
                                            found
                                        </Text>
                                        <Button
                                            mode="text"
                                            compact
                                            onPress={() => setSearchQuery('')}
                                        >
                                            Clear
                                        </Button>
                                    </View>
                                )}
                            </View>

                            {/* Process Items List */}
                            <View style={styles.itemsListHeader}>
                                <Text style={styles.itemsListTitle}>
                                    Picking locations (
                                    {getProcessItems().length} items)
                                </Text>
                            </View>

                            {/* Use the new PickingLocationManager component */}
                            {filteredItems.length === 0 ? (
                                <Text style={styles.emptyListText}>
                                    {searchQuery.trim() !== ''
                                        ? 'No matching locations found. Try a different search term.'
                                        : 'No items to pick in this order.'}
                                </Text>
                            ) : (
                                <PickingLocationManager
                                    items={filteredItems}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    pendingUpdates={pickingStore.pendingUpdates}
                                />
                            )}

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <Button
                                    mode="outlined"
                                    onPress={handleGoBack}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={() =>
                                        setConfirmDialogVisible(true)
                                    }
                                    style={styles.processButton}
                                    loading={isProcessing}
                                    disabled={
                                        isProcessing ||
                                        !pickingStore.isProcessComplete
                                    }
                                >
                                    Complete Picking
                                </Button>
                            </View>

                            {/* Bottom padding */}
                            <View style={styles.bottomPadding} />
                        </ScrollView>
                    </TouchableWithoutFeedback>
                )}

                {/* Confirmation Dialog */}
                <Portal>
                    <Dialog
                        visible={confirmDialogVisible}
                        onDismiss={() => setConfirmDialogVisible(false)}
                    >
                        <Dialog.Title>Confirm Process</Dialog.Title>
                        <Dialog.Content>
                            {!pickingStore.isProcessComplete ? (
                                <Text style={styles.warningText}>
                                    All items must be fully picked before
                                    completing the process. Currently at{' '}
                                    {Math.round(
                                        pickingStore.processProgress * 100
                                    )}
                                    % completion.
                                </Text>
                            ) : (
                                <Text>
                                    Are you sure you want to complete processing
                                    this picking order? This action cannot be
                                    undone.
                                </Text>
                            )}
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button
                                onPress={() => setConfirmDialogVisible(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={handleCompleteProcess}
                                loading={isProcessing}
                                disabled={
                                    isProcessing ||
                                    !pickingStore.isProcessComplete
                                }
                            >
                                Confirm
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/* Scanner Modal */}
                <ProductScannerModal
                    visible={scannerModalVisible}
                    onClose={handleCloseScanner}
                    onCodeScanned={handleCodeScanned}
                />

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
    // Search section styles
    searchSection: {
        marginBottom: 16,
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchInputWrapper: {
        flex: 1,
        marginRight: 8,
    },
    searchInput: {
        backgroundColor: '#ffffff',
    },
    searchResultsInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
    },
    searchResultsText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    scanButton: {
        paddingVertical: 6,
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
    // Action button styles
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 8,
        gap: 8,
    },
    cancelButton: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 6,
        borderRadius: 4,
    },
    processButton: {
        flex: 2,
        marginHorizontal: 4,
        paddingVertical: 6,
        borderRadius: 4,
    },
    bottomPadding: {
        height: 40,
    },
    emptyListText: {
        textAlign: 'center',
        marginVertical: 20,
        color: '#666',
    },
    warningText: {
        color: '#f44336',
        marginBottom: 8,
    },
})

export default withProviders(PickingStoreProvider)(PickingProcessScreen)
