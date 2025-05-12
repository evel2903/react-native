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
import { useStorageStore } from '../Stores/StorageStore/UseStorageStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { StorageStoreProvider } from '../Stores/StorageStore/StorageStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { Status, getStatusDisplayName } from '@/src/Common/Domain/Enums/Status'
import {
    PRIORITY,
    getPriorityDisplayName,
    getPriorityColor,
} from '@/src/Common/Domain/Enums/Priority'
import { StorageVoucherDetailEntity, StorageVoucherItemEntity } from '@/src/Storage/Domain/Entities/StorageVoucherEntity'
import CenteredAccordion from '../Components/CenteredAccordion'
import StorageProcessDetailComponent from '../Components/StorageProcessDetailComponent'
import LocationEditModal from '../Components/LocationEditModal'
import ProductScannerModal from '../Components/ProductScannerModal'
import { useMasterDataStore } from '@/src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore'

type StorageProcessScreenRouteProp = RouteProp<RootStackParamList, 'StorageProcess'>

const StorageProcessScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'Storage'>>()
    const route = useRoute<StorageProcessScreenRouteProp>()
    const storageStore = useStorageStore()
    const masterDataStore = useMasterDataStore()
    const theme = useTheme()

    // Get storage ID from route params
    const storageId = route.params?.id

    // States
    const [infoExpanded, setInfoExpanded] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [confirmDialogVisible, setConfirmDialogVisible] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)

    // Location edit modal state
    const [locationModalVisible, setLocationModalVisible] = useState(false)
    const [selectedDetailItem, setSelectedDetailItem] = useState<StorageVoucherDetailEntity | null>(null)

    // Scanner modal state
    const [scannerModalVisible, setScannerModalVisible] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredDetails, setFilteredDetails] = useState<StorageVoucherDetailEntity[]>([])

    // Fetch storage data and master data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Load storage voucher details
                if (storageId) {
                    const success = await storageStore.getStorageVoucherDetails(
                        storageId
                    )
                    if (!success) {
                        showSnackbar('Failed to load storage voucher details')
                    }
                } else {
                    showSnackbar('No storage voucher ID provided')
                }

                // Load master data needed for processing
                await Promise.all([
                    masterDataStore.loadWarehouses(),
                    masterDataStore.loadAreas(),
                    masterDataStore.loadRows(),
                    masterDataStore.loadShelfs(),
                ])
            } catch (error) {
                console.error('Error loading data:', error)
                showSnackbar('Error loading required data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [storageId])

    const handleGoBack = () => {
        navigation.goBack()
    }

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message)
        setSnackbarVisible(true)
    }

    const handleProcessStorage = async () => {
        setIsProcessing(true)
        try {
            if (storageId) {
                const success = await storageStore.processStorageVoucher(storageId)
                if (success) {
                    showSnackbar('Storage voucher processed successfully')
                    // Navigate back to storage list after successful processing
                    setTimeout(() => {
                        navigation.navigate('Storage')
                    }, 1500)
                } else {
                    showSnackbar('Failed to process storage voucher')
                }
            }
        } catch (error) {
            console.error('Error processing storage voucher:', error)
            showSnackbar('Error processing storage voucher')
        } finally {
            setIsProcessing(false)
            setConfirmDialogVisible(false)
        }
    }

    const handleOpenLocationModal = (detailItem: StorageVoucherDetailEntity) => {
        setSelectedDetailItem(detailItem)
        setLocationModalVisible(true)
    }

    const handleCloseLocationModal = () => {
        setLocationModalVisible(false)
        setSelectedDetailItem(null)
    }

    const handleSaveLocations = async (updatedItems: any[]) => {
        // Show loading indicator or disable the button while saving
        setIsLoading(true);

        try {
            // Process items through the API
            const processedItems = await storageStore.updateStorageVoucherItems(updatedItems);

            // Check if all items were processed successfully
            const hasErrors = processedItems.some(item => item === null);

            if (hasErrors) {
                showSnackbar('Some locations could not be updated');
            } else {
                showSnackbar('Storage locations updated successfully');
            }

            // Update the local state with the updated items
            if (selectedDetailItem && storageStore.selectedStorageVoucher) {
                const detailIndex = storageStore.selectedStorageVoucher.details.findIndex(
                    detail => detail.id === selectedDetailItem.id
                );

                if (detailIndex !== -1) {
                    // Filter out any null items and update the UI
                    const validItems = processedItems.filter(Boolean) as StorageVoucherItemEntity[];
                    storageStore.selectedStorageVoucher.details[detailIndex].storageVoucherItems = validItems;
                }
            }
        } catch (error) {
            console.error('Error saving locations:', error);
            showSnackbar('Failed to update storage locations');
        } finally {
            setIsLoading(false);
            handleCloseLocationModal();
        }
    };

    const handleOpenScanner = () => {
        setScannerModalVisible(true)
    }

    const handleCloseScanner = () => {
        setScannerModalVisible(false)
    }

    const handleCodeScanned = (code: string) => {
        // Try to parse the scanned code as JSON
        try {
            const parsedData = JSON.parse(code);
            if (parsedData && typeof parsedData === 'object') {
                // If it contains a code property, use it for search
                if ('code' in parsedData) {
                    setSearchQuery(parsedData.code || '');
                    showSnackbar(`Product found: ${parsedData.name || 'Unknown'}`);
                } else {
                    // If no code property, use the raw string
                    setSearchQuery(code);
                    showSnackbar('Product code scanned');
                }
            } else {
                // If not valid JSON object, use the raw string
                setSearchQuery(code);
                showSnackbar('Product code scanned');
            }
        } catch (error) {
            // If not valid JSON, use the raw string
            setSearchQuery(code);
            showSnackbar('Product code scanned');
        }

        setScannerModalVisible(false);
    }

    // Render the form content inside the accordion
    const renderFormContent = () => {
        const storageData = storageStore.selectedStorageVoucher

        if (!storageData) return null

        return (
            <>
                {/* Code Section with Priority Chip */}
                <View style={styles.codeSection}>
                    <View style={styles.codeContainer}>
                        <View>
                            <Text style={styles.labelText}>Code</Text>
                            <Text style={styles.valueText}>{storageData.code || '-'}</Text>
                        </View>
                        <View style={styles.priorityChipWrapper}>
                            <Chip
                                style={{
                                    backgroundColor: getPriorityColor(storageData.priority as any),
                                }}
                                textStyle={styles.priorityChipText}
                            >
                                {getPriorityDisplayName(storageData.priority as any)}
                            </Chip>
                        </View>
                    </View>
                </View>

                {/* Storage Date and Status Row */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Storage Date</Text>
                        <Text style={styles.valueText}>
                            {storageData.storageDate ? formatDate(storageData.storageDate) : '-'}
                        </Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Status</Text>
                        <Text style={styles.valueText}>
                            {getStatusDisplayName(storageData.status as Status)}
                        </Text>
                    </View>
                </View>

                {/* Created by and Assigned to Row */}
                <View style={styles.infoRow}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Created By</Text>
                        <Text style={styles.valueText}>{storageData.createdBy || '-'}</Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.labelText}>Assigned To</Text>
                        <Text style={styles.valueText}>{storageData.assignedName || '-'}</Text>
                    </View>
                </View>

                {/* Completed At (if available) */}
                {storageData.completedAt && (
                    <View style={styles.infoSection}>
                        <Text style={styles.labelText}>Completed At</Text>
                        <Text style={styles.valueText}>{formatDate(storageData.completedAt)}</Text>
                    </View>
                )}

                {/* Notes Section */}
                {storageData.notes && (
                    <View style={styles.infoSection}>
                        <Text style={styles.labelText}>Notes</Text>
                        <Text style={styles.notesText}>{storageData.notes}</Text>
                    </View>
                )}
            </>
        )
    }

    // Get background color based on priority
    const getAccordionBackgroundColor = () => {
        const storageData = storageStore.selectedStorageVoucher
        if (!storageData) return '#e8f5e9' // Default light green

        switch (storageData.priority) {
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

    // Get the details array safely
    const getStorageDetails = () => {
        if (!storageStore.selectedStorageVoucher) return []
        return storageStore.selectedStorageVoucher.details || []
    }

    // Filter details based on search query
    useEffect(() => {
        const details = getStorageDetails()
        if (searchQuery.trim() === '') {
            setFilteredDetails(details)
            return
        }

        const normalizedQuery = searchQuery.toLowerCase().trim()
        const filtered = details.filter(item =>
            (item.code && item.code.toLowerCase().includes(normalizedQuery)) ||
            (item.name && item.name.toLowerCase().includes(normalizedQuery))
        )

        setFilteredDetails(filtered)
    }, [searchQuery, storageStore.selectedStorageVoucher])

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
                    <Appbar.Content title="Process Storage Voucher" />
                </Appbar.Header>

                {isLoading || !storageStore.selectedStorageVoucher ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={theme.theme.colors.primary}
                        />
                        <Text style={styles.loadingText}>
                            Loading storage voucher details...
                        </Text>
                    </View>
                ) : (
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView style={styles.scrollView}>
                            {/* Accordion for form info section */}
                            <Surface
                                style={[
                                    styles.accordionContainer,
                                    { backgroundColor: getAccordionBackgroundColor() }
                                ]}
                                elevation={1}
                            >
                                <CenteredAccordion
                                    title="Storage Voucher Information"
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

                            {/* Product Search Section */}
                            <View style={styles.searchSection}>
                                <View style={styles.searchBarContainer}>
                                    <View style={styles.searchInputWrapper}>
                                        <TextInput
                                            dense
                                            mode="outlined"
                                            placeholder="Search goods"
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
                                            {filteredDetails.length} {filteredDetails.length === 1 ? 'result' : 'results'} found
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

                            {/* Storage Details List */}
                            <View style={styles.detailsListHeader}>
                                <Text style={styles.detailsListTitle}>
                                    Storage details
                                </Text>
                            </View>

                            {filteredDetails.length === 0 ? (
                                <Text style={styles.emptyListText}>
                                    {searchQuery.trim() !== ''
                                        ? 'No matching products found. Try a different search term.'
                                        : 'No items in this storage voucher.'}
                                </Text>
                            ) : (
                                filteredDetails.map((item: StorageVoucherDetailEntity, index: number) => (
                                    <StorageProcessDetailComponent
                                        key={item.id || index}
                                        item={item}
                                        onProcess={() => handleOpenLocationModal(item)}
                                    />
                                ))
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
                                    onPress={() => setConfirmDialogVisible(true)}
                                    style={styles.processButton}
                                    loading={isProcessing}
                                    disabled={isProcessing}
                                >
                                    Complete Processing
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
                            <Text>
                                Are you sure you want to complete processing this storage voucher?
                                This action cannot be undone.
                            </Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
                            <Button
                                onPress={handleProcessStorage}
                                loading={isProcessing}
                                disabled={isProcessing}
                            >
                                Confirm
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/* Location Edit Modal */}
                <LocationEditModal
                    visible={locationModalVisible}
                    onClose={handleCloseLocationModal}
                    onSave={handleSaveLocations}
                    detailItem={selectedDetailItem}
                    warehouses={masterDataStore.warehouses.data}
                    areas={masterDataStore.areas.data}
                    rows={masterDataStore.rows.data}
                    shelfs={masterDataStore.shelfs.data}
                />

                {/* Product Scanner Modal */}
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
    // Details list styles
    detailsListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailsListTitle: {
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
})

export default withProviders(StorageStoreProvider)(StorageProcessScreen)