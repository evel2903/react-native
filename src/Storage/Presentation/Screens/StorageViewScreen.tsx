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
    TextInput,
    Button,
    Text,
    Snackbar,
    Surface,
    TouchableRipple,
    ActivityIndicator,
    List,
} from 'react-native-paper'
import { formatDate, formatCurrency } from '@/src/Core/Utils'
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
} from '@/src/Common/Domain/Enums/Priority'

// Custom Accordion Component with centered title
const CenteredAccordion = ({
    title,
    expanded,
    onPress,
    children,
}: {
    title: string
    expanded: boolean
    onPress: () => void
    children: React.ReactNode
}) => {
    return (
        <List.Accordion
            title={title}
            expanded={expanded}
            onPress={onPress}
            style={styles.accordion}
            titleStyle={styles.accordionTitle}
            right={props => (
                <List.Icon
                    {...props}
                    icon={expanded ? 'chevron-up' : 'chevron-down'}
                    style={styles.accordionIcon}
                />
            )}
        >
            {children}
        </List.Accordion>
    )
}

// Read-only version of the storage voucher item component
const ReadOnlyStorageVoucherItem = ({ item }: any) => (
    <Surface style={styles.itemCard} elevation={1}>
        <View style={styles.itemHeader}>
            <View style={styles.itemCodeSection}>
                <TextInput
                    dense
                    value={item.code}
                    mode="outlined"
                    editable={false}
                    style={styles.codeInput}
                />
            </View>
        </View>

        <Text style={styles.itemName}>{item.name}</Text>

        <View style={styles.itemInfo}>
            <Text style={styles.itemInfoText}>
                Stock ID: {item.stockId}
            </Text>
            <Text style={styles.itemInfoText}>
                Supplier: {item.supplier}
            </Text>
            <Text style={styles.itemInfoText}>
                Lot Number: {item.lotNumber}
            </Text>
        </View>

        <View style={styles.itemRow}>
            <TextInput
                dense
                label="Expiry date"
                value={formatDate(item.expiryDate)}
                mode="outlined"
                style={styles.itemFullInput}
                editable={false}
            />
        </View>

        <View style={styles.itemRow}>
            <TextInput
                dense
                label="Quantity"
                value={item.quantity.toString()}
                mode="outlined"
                editable={false}
                style={styles.itemHalfInput}
            />
            <TextInput
                dense
                label="Cost"
                value={formatCurrency(item.cost)}
                mode="outlined"
                editable={false}
                style={styles.itemHalfInput}
            />
        </View>

        {item.notes && (
            <View style={styles.itemRow}>
                <TextInput
                    dense
                    label="Note"
                    value={item.notes}
                    mode="outlined"
                    multiline
                    editable={false}
                    numberOfLines={2}
                    style={styles.itemFullInput}
                />
            </View>
        )}
    </Surface>
)

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

    // Get priority button style for display purposes
    const getPriorityButtonStyle = (priorityValue: number) => {
        const isSelected =
            storageStore.selectedStorageVoucher &&
            storageStore.selectedStorageVoucher.priority === priorityValue
        return [
            styles.priorityButton,
            {
                backgroundColor: isSelected
                    ? priorityValue === PRIORITY.High
                        ? '#ff5252'
                        : priorityValue === PRIORITY.Medium
                        ? '#fb8c00'
                        : '#4caf50'
                    : 'transparent',
                borderWidth: 1,
                borderColor:
                    priorityValue === PRIORITY.High
                        ? '#ff5252'
                        : priorityValue === PRIORITY.Medium
                        ? '#fb8c00'
                        : '#4caf50',
            },
        ]
    }

    // Get text style based on selection state
    const getPriorityTextStyle = (priorityValue: number) => {
        const isSelected =
            storageStore.selectedStorageVoucher &&
            storageStore.selectedStorageVoucher.priority === priorityValue
        return [
            styles.priorityButtonText,
            {
                color: isSelected
                    ? 'white'
                    : priorityValue === PRIORITY.High
                    ? '#ff5252'
                    : priorityValue === PRIORITY.Medium
                    ? '#fb8c00'
                    : '#4caf50',
            },
        ]
    }

    // Render the form content inside the accordion
    const renderFormContent = () => {
        const storageData = storageStore.selectedStorageVoucher

        if (!storageData) return null

        return (
            <>
                {/* Row 1: Code and Priority */}
                <View style={styles.row}>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Code"
                            editable={false}
                            value={storageData?.code || ''}
                            mode="outlined"
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.inputHalf}>
                        <View style={styles.priorityLabelContainer}>
                            <Text variant="bodySmall" style={styles.priorityLabel}>
                                Priority
                            </Text>
                            <View style={styles.priorityButtonsContainer}>
                                <TouchableRipple
                                    style={getPriorityButtonStyle(PRIORITY.High)}
                                    disabled
                                >
                                    <Text
                                        style={getPriorityTextStyle(PRIORITY.High)}
                                    >
                                        {getPriorityDisplayName(PRIORITY.High)}
                                    </Text>
                                </TouchableRipple>

                                <TouchableRipple
                                    style={getPriorityButtonStyle(PRIORITY.Medium)}
                                    disabled
                                >
                                    <Text
                                        style={getPriorityTextStyle(
                                            PRIORITY.Medium
                                        )}
                                    >
                                        {getPriorityDisplayName(
                                            PRIORITY.Medium
                                        )}
                                    </Text>
                                </TouchableRipple>

                                <TouchableRipple
                                    style={getPriorityButtonStyle(PRIORITY.Low)}
                                    disabled
                                >
                                    <Text
                                        style={getPriorityTextStyle(PRIORITY.Low)}
                                    >
                                        {getPriorityDisplayName(PRIORITY.Low)}
                                    </Text>
                                </TouchableRipple>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Row 2: Storage Date and Status */}
                <View style={styles.row}>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Storage date"
                            value={
                                storageData?.storageDate
                                    ? formatDate(storageData.storageDate)
                                    : ''
                            }
                            mode="outlined"
                            style={styles.input}
                            editable={false}
                        />
                    </View>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Status"
                            value={getStatusDisplayName(
                                storageData?.status as Status
                            )}
                            mode="outlined"
                            editable={false}
                            style={styles.input}
                        />
                    </View>
                </View>

                {/* Row 3: Created by and Assigned to */}
                <View style={styles.row}>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Created by"
                            value={storageData?.createdBy || ''}
                            editable={false}
                            mode="outlined"
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Assigned to"
                            value={storageData?.assignedName || ''}
                            editable={false}
                            mode="outlined"
                            style={styles.input}
                        />
                    </View>
                </View>

                {/* Row 4: Completed at (if available) */}
                {/* Add any additional fields if needed */}

                {/* Row 5: Notes */}
                <View style={styles.noteRow}>
                    <View style={styles.inputFull}>
                        <TextInput
                            dense
                            label="Note"
                            value={storageData?.notes || ''}
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            style={[styles.input, styles.noteInput]}
                            editable={false}
                        />
                    </View>
                </View>
            </>
        )
    }

    // Type guard to get the details array safely
    const getStorageDetails = () => {
        if (!storageStore.selectedStorageVoucher) return []
        
        // Based on the API response, details might be more complex
        const details = storageStore.selectedStorageVoucher as any
        return details.details || []
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
                                style={styles.accordionContainer}
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
                                    Storage Details
                                </Text>
                            </View>

                            {getStorageDetails().length === 0 ? (
                                <Text style={styles.emptyListText}>
                                    No items in this storage voucher.
                                </Text>
                            ) : (
                                getStorageDetails().map((item: any) => (
                                    <ReadOnlyStorageVoucherItem
                                        key={item.id}
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
    accordion: {
        padding: 0,
    },
    accordionTitle: {
        fontWeight: 'bold',
    },
    accordionIcon: {
        margin: 0,
    },
    formContent: {
        padding: 12,
    },
    // Form styles
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    noteRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    inputHalf: {
        width: '48%',
    },
    inputFull: {
        flex: 1,
    },
    input: {
        backgroundColor: 'transparent',
    },
    // Priority styles
    priorityLabelContainer: {
        width: '100%',
    },
    priorityLabel: {
        marginBottom: 4,
        color: '#666',
    },
    priorityButtonsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        height: 80,
    },
    priorityButton: {
        flex: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
        paddingHorizontal: 2,
    },
    priorityButtonText: {
        fontWeight: 'bold',
        fontSize: 11,
        textAlign: 'center',
    },
    noteInput: {
        height: 100,
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
    // Storage item styles
    itemCard: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemCodeSection: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    codeInput: {
        flex: 1,
        marginRight: 8,
    },
    itemName: {
        marginVertical: 6,
        fontWeight: 'bold',
        fontSize: 16,
    },
    itemInfo: {
        marginBottom: 8,
    },
    itemInfoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    itemFullInput: {
        flex: 1,
    },
    itemHalfInput: {
        width: '48%',
    },
})

export default withProviders(StorageStoreProvider)(StorageViewScreen)