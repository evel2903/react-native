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
import { StorageVoucherDetailEntity } from '@/src/Storage/Domain/Entities/StorageVoucherEntity'
import CenteredAccordion from '../Components/CenteredAccordion'
import StorageVoucherDetailComponent from '../Components/StorageVoucherDetailComponent'

type StorageViewScreenRouteProp = RouteProp<RootStackParamList, 'StorageView'>

const StorageViewScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'Storage'>>()
    const route = useRoute<StorageViewScreenRouteProp>()
    const storageStore = useStorageStore()
    const theme = useTheme()

    // Get storage ID from route params
    const storageId = route.params?.id

    // States
    const [infoExpanded, setInfoExpanded] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')

    // Fetch storage data when component mounts
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
            } catch (error) {
                console.error('Error loading data:', error)
                showSnackbar('Error loading storage voucher details')
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

    // Calculate storage completion stats
    const calculateStorageStats = () => {
        if (!storageStore.selectedStorageVoucher || !storageStore.selectedStorageVoucher.details) {
            return { 
                totalItems: 0, 
                storedItems: 0, 
                percentage: 0 
            };
        }

        const details = storageStore.selectedStorageVoucher.details;
        
        // Calculate total quantity and allocated quantity across all details
        let totalQuantity = 0;
        let allocatedQuantity = 0;
        
        details.forEach(detail => {
            totalQuantity += detail.quantity || 0;
            const detailAllocated = (detail.storageVoucherItems || []).reduce(
                (sum, item) => sum + (item.quantity || 0), 
                0
            );
            allocatedQuantity += detailAllocated;
        });
        
        // Calculate percentage
        const percentage = totalQuantity > 0 ? Math.min(allocatedQuantity / totalQuantity, 1) : 0;
        
        return {
            totalItems: totalQuantity,
            storedItems: allocatedQuantity,
            percentage
        };
    };

    // Get progress color based on completion percentage
    const getProgressColor = (percentage: number) => {
        if (percentage === 0) return '#f44336'; // Red for not started
        if (percentage < 0.5) return '#ff9800'; // Orange for < 50%
        if (percentage < 1) return '#2196f3'; // Blue for partial completion
        return '#4caf50'; // Green for complete
    };

    // Render the form content inside the accordion
    const renderFormContent = () => {
        const storageData = storageStore.selectedStorageVoucher

        if (!storageData) return null

        // Get storage stats
        const storageStats = calculateStorageStats();

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

                {/* Overall Progress Section */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Completion Status</Text>
                        <Text style={styles.progressPercentage}>
                            {Math.round(storageStats.percentage * 100)}%
                        </Text>
                    </View>
                    <ProgressBar
                        progress={storageStats.percentage}
                        color={getProgressColor(storageStats.percentage)}
                        style={styles.progressBar}
                    />
                    <Text style={styles.progressDetail}>
                        {storageStats.storedItems} of {storageStats.totalItems} items stored
                    </Text>
                </View>
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
                    <Appbar.Content title="View Storage Voucher" />
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

                            {/* Storage Details List */}
                            <View style={styles.detailsListHeader}>
                                <Text style={styles.detailsListTitle}>
                                    Storage details
                                </Text>
                            </View>

                            {getStorageDetails().length === 0 ? (
                                <Text style={styles.emptyListText}>
                                    No items in this storage voucher.
                                </Text>
                            ) : (
                                getStorageDetails().map((item: StorageVoucherDetailEntity, index: number) => (
                                    <StorageVoucherDetailComponent
                                        key={item.id || index}
                                        item={item}
                                    />
                                ))
                            )}

                            {/* Action Button - Back button */}
                            <View style={styles.actionButtons}>
                                <Button
                                    mode="contained"
                                    onPress={handleGoBack}
                                    style={styles.backButton}
                                >
                                    Back
                                </Button>
                            </View>

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
    progressDetail: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'right',
    },
    detailsListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    detailsListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Action button styles
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    backButton: {
        flex: 1,
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

export default withProviders(StorageStoreProvider)(StorageViewScreen)