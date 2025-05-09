import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native'
import {
    Appbar,
    TextInput,
    Button,
    Text,
    IconButton,
    Menu,
    Divider,
    Snackbar,
    Surface,
    TouchableRipple,
    ActivityIndicator,
    List,
} from 'react-native-paper'
import { formatDate } from '@/src/Core/Utils'
import { DatePickerModal } from 'react-native-paper-dates'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import {
    RootScreenNavigationProp,
    RootStackParamList,
} from '@/src/Core/Presentation/Navigation/Types/Index'
import { observer } from 'mobx-react'
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore'
import { useMasterDataStore } from '@/src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { StockInStoreProvider } from '../Stores/StockInStore/StockInStoreProvider'
import { MasterDataStoreProvider } from '@/src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { Status } from '@/src/Common/Domain/Enums/Status'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'
import { AuthStoreProvider } from '@/src/Auth/Presentation/Stores/AuthStore/AuthStoreProvider'
import {
    PRIORITY,
    getPriorityDisplayName,
} from '@/src/Common/Domain/Enums/Priority'
import GoodsScannerModal from '../Components/GoodsScannerModal'
import { GoodsEntity } from '@/src/Common/Domain/Entities/GoodsEntity'
import StockInGoodsItem from '../Components/StockInGoodsItem'

// Define interface for goods items
interface GoodsItem {
    goodsId: string
    goodsCode: string
    goodsName: string
    quantity: number
    price: number
    expiryDate: string
    notes: string
    stockInId?: string // Added for editing existing items
}

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

type StockInEditScreenRouteProp = RouteProp<RootStackParamList, 'StockInEdit'>

const StockInEditScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'StockIn'>>()
    const route = useRoute<StockInEditScreenRouteProp>()
    const stockInStore = useStockInStore()
    const masterDataStore = useMasterDataStore()
    const authStore = useAuthStore()
    const theme = useTheme()

    // Get stock ID from route params
    const stockId = route.params?.id

    // States for form data
    const [code, setCode] = useState('')
    const [supplierId, setSupplierId] = useState('')
    const [lotNumber, setLotNumber] = useState('')
    const [stockInDate, setStockInDate] = useState(
        new Date().toISOString().split('T')[0]
    )
    const [selectedStockInDate, setSelectedStockInDate] = useState(new Date())
    const [description, setDescription] = useState('')
    const [totalAmount, setTotalAmount] = useState('0')
    const [status, setStatus] = useState(Status.Draft)
    const [notes, setNotes] = useState('')
    const [priority, setPriority] = useState(2) // Default to Medium priority

    // Goods list
    const [goodsItems, setGoodsItems] = useState<GoodsItem[]>([])
    const [currentItem, setCurrentItem] = useState<GoodsItem | null>(null)
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(
        null
    )

    // UI state
    const [infoExpanded, setInfoExpanded] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Modals and menus state
    const [supplierMenuVisible, setSupplierMenuVisible] = useState(false)
    const [statusMenuVisible, setStatusMenuVisible] = useState(false)
    const [stockInDatePickerVisible, setStockInDatePickerVisible] =
        useState(false)
    const [scannerModalVisible, setScannerModalVisible] = useState(false)

    // Status options
    const statusOptions = [{ value: Status.Draft, label: 'Draft' }]

    // Fetch stock data and master data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                // Load master data
                await Promise.all([
                    masterDataStore.loadSuppliers(),
                    masterDataStore.loadUnits(),
                ])

                // Load stock details
                if (stockId) {
                    const stockIn = await stockInStore.getStockInDetails(
                        stockId
                    )
                    if (stockIn) {
                        // Populate form fields with stock data
                        setCode(stockIn.code || '')
                        setSupplierId(stockIn.supplierId || '')
                        setLotNumber(stockIn.lotNumber || '')
                        setStockInDate(
                            stockIn.inDate?.split('T')[0] ||
                                new Date().toISOString().split('T')[0]
                        )
                        setSelectedStockInDate(
                            new Date(stockIn.inDate || new Date())
                        )
                        setDescription(stockIn.description || '')
                        setTotalAmount(stockIn.totalAmount?.toString() || '0')
                        setStatus((stockIn.status as Status) || Status.Draft)
                        setNotes(stockIn.notes || '')
                        setPriority(stockIn.priority || 2)

                        // Convert stock in details to goods items
                        if (stockIn.details && stockIn.details.length > 0) {
                            const items: GoodsItem[] = stockIn.details.map(
                                detail => ({
                                    stockInId: stockId,
                                    goodsId: detail.goodsId,
                                    goodsCode: detail.goodsCode || '',
                                    goodsName: detail.goodsName || '',
                                    quantity: detail.quantity,
                                    price: parseFloat(detail.price),
                                    expiryDate:
                                        detail.expiryDate ||
                                        new Date().toISOString(),
                                    notes: detail.notes || '',
                                })
                            )
                            setGoodsItems(items)
                        }
                    } else {
                        showSnackbar('Failed to load stock in details')
                    }
                } else {
                    showSnackbar('No stock ID provided')
                    navigation.goBack()
                }
            } catch (error) {
                console.error('Error loading data:', error)
                showSnackbar('Error loading stock in details')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [stockId])

    // Calculate total amount whenever goods items change
    useEffect(() => {
        const total = goodsItems.reduce((sum, item) => {
            return sum + item.quantity * item.price
        }, 0)

        setTotalAmount(total.toString())
    }, [goodsItems])

    const handleGoBack = () => {
        navigation.goBack()
    }

    const showSnackbar = (message: string) => {
        setSnackbarMessage(message)
        setSnackbarVisible(true)
    }

    const resetGoodsItemForm = () => {
        setCurrentItem({
            goodsId: '',
            goodsCode: '',
            goodsName: '',
            quantity: 1,
            price: 0,
            expiryDate: new Date().toISOString(),
            notes: '',
        })
        setCurrentItemIndex(null)
    }

    // Handle stock in date confirmation
    const onConfirmStockInDate = ({ date }: { date: Date }) => {
        setSelectedStockInDate(date)
        setStockInDate(date.toISOString().split('T')[0])
        setStockInDatePickerVisible(false)
    }

    // Show scanner modal for adding goods
    const addGoodsItem = () => {
        resetGoodsItemForm()
        setScannerModalVisible(true)
    }

    // Handle goods selected from scanner
    const handleGoodsFromScanner = (goods: GoodsEntity) => {
        if (goods) {
            // Check if this goods item already exists in the list
            const existingItemIndex = goodsItems.findIndex(
                item => item.goodsId === goods.id
            )

            // Create a new item with default values
            const newItem = {
                goodsId: goods.id,
                goodsCode: goods.code,
                goodsName: goods.name,
                quantity: 1,
                price: 0,
                expiryDate: new Date().toISOString(),
                notes: '',
                stockInId: stockId, // Add stockInId for existing stock
            }

            setCurrentItem(newItem)

            // If we're currently editing an item
            if (currentItemIndex !== null) {
                const updatedItems = [...goodsItems]
                updatedItems[currentItemIndex] = newItem
                setGoodsItems(updatedItems)
            }
            // If this goods item already exists in the list
            else if (existingItemIndex !== -1) {
                // Clear the data in the existing item rather than creating a new one
                const updatedItems = [...goodsItems]
                updatedItems[existingItemIndex] = newItem
                setGoodsItems(updatedItems)

                // Show notification about updating existing item
                showSnackbar(`Updated existing ${goods.name} item`)
            }
            // Otherwise add as a new item
            else {
                setGoodsItems([...goodsItems, newItem])
            }
        }

        // Close the scanner modal
        setScannerModalVisible(false)
    }

    const removeGoodsItem = (goodsId: string) => {
        setGoodsItems(goodsItems.filter(item => item.goodsId !== goodsId))
    }

    const updateGoodsItem = (
        goodsId: string,
        field: keyof GoodsItem,
        value: string | number
    ) => {
        setGoodsItems(
            goodsItems.map(item => {
                if (item.goodsId === goodsId) {
                    return { ...item, [field]: value }
                }
                return item
            })
        )
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!supplierId) {
            newErrors.supplierId = 'Supplier is required'
        }

        if (!stockInDate) {
            newErrors.stockInDate = 'Date is required'
        }

        if (goodsItems.length === 0) {
            newErrors.goodsItems = 'At least one goods item is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleUpdate = async () => {
        if (!validateForm()) {
            showSnackbar('Please fill in all required fields')
            return
        }

        setIsSubmitting(true)

        try {
            // Format date to ISO
            const isoDate = new Date(stockInDate).toISOString()

            // Prepare payload according to API requirements
            const payload = {
                code,
                supplierId,
                inDate: isoDate,
                description,
                status,
                lotNumber,
                notes,
                priority,
                totalAmount: parseFloat(totalAmount),
                details: goodsItems.map(item => ({
                    stockInId: stockId,
                    goodsId: item.goodsId,
                    goodsCode: item.goodsCode,
                    goodsName: item.goodsName,
                    quantity: item.quantity,
                    price: item.price,
                    expiryDate: item.expiryDate,
                    notes: item.notes,
                })),
            }

            // Call store to update data
            const result = await stockInStore.updateStockIn(stockId, payload)

            if (result) {
                showSnackbar('Stock in updated successfully')

                // Short timeout to allow the user to see the success message
                // before navigating back to the list screen
                setTimeout(() => {
                    navigation.goBack()
                }, 1500)
            } else {
                showSnackbar('Failed to update stock in')
            }
        } catch (error) {
            console.error('Error updating stock in:', error)
            showSnackbar('An error occurred while updating stock in')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Priority styles based on value
    const getPriorityButtonStyle = (priorityValue: number) => {
        const isSelected = priorityValue === priority
        const baseStyles = [
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

        return baseStyles
    }

    // Get text style based on selection state
    const getPriorityTextStyle = (priorityValue: number) => {
        const isSelected = priorityValue === priority
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
    const renderFormContent = () => (
        <>
            {/* Row 1: Code and Supplier */}
            <View style={styles.row}>
                <View style={styles.inputHalf}>
                    <TextInput
                        dense
                        label="Code"
                        disabled
                        value={code}
                        mode="outlined"
                        style={styles.input}
                    />
                </View>
                <View style={styles.inputHalf}>
                    <Menu
                        visible={supplierMenuVisible}
                        onDismiss={() => setSupplierMenuVisible(false)}
                        anchor={
                            <TextInput
                                dense
                                label="Supplier"
                                value={
                                    supplierId
                                        ? masterDataStore.suppliers.data.find(
                                              s => s.id === supplierId
                                          )?.name || ''
                                        : ''
                                }
                                placeholder="Select Supplier"
                                mode="outlined"
                                style={styles.input}
                                editable={false}
                                error={!!errors.supplierId}
                                right={
                                    <TextInput.Icon
                                        icon="menu-down"
                                        onPress={() =>
                                            setSupplierMenuVisible(true)
                                        }
                                    />
                                }
                                onTouchStart={() =>
                                    setSupplierMenuVisible(true)
                                }
                            />
                        }
                    >
                        {masterDataStore.suppliers.data
                            .filter(s => s.isActive && !s.isDeleted)
                            .map(s => (
                                <Menu.Item
                                    key={s.id}
                                    onPress={() => {
                                        setSupplierId(s.id)
                                        setSupplierMenuVisible(false)
                                    }}
                                    title={s.name}
                                />
                            ))}
                    </Menu>
                    {errors.supplierId && (
                        <Text style={styles.errorText}>
                            {errors.supplierId}
                        </Text>
                    )}
                </View>
            </View>

            {/* Row 2: Lot Number and Stock In Date */}
            <View style={styles.row}>
                <View style={styles.inputHalf}>
                    <TextInput
                        dense
                        label="Lot number"
                        value={lotNumber}
                        onChangeText={setLotNumber}
                        mode="outlined"
                        style={styles.input}
                    />
                </View>
                <View style={styles.inputHalf}>
                    {/* Date picker as TextInput */}
                    <TextInput
                        dense
                        label="Stock in date"
                        value={formatDate(stockInDate)}
                        mode="outlined"
                        style={styles.input}
                        editable={false}
                        error={!!errors.stockInDate}
                        right={
                            <TextInput.Icon
                                icon="calendar"
                                onPress={() =>
                                    setStockInDatePickerVisible(true)
                                }
                            />
                        }
                        onTouchStart={() => setStockInDatePickerVisible(true)}
                    />

                    {/* Stock In Date Picker Modal */}
                    <DatePickerModal
                        locale="en"
                        mode="single"
                        visible={stockInDatePickerVisible}
                        onDismiss={() => setStockInDatePickerVisible(false)}
                        date={selectedStockInDate}
                        onConfirm={({ date }) => {
                            if (date) {
                                onConfirmStockInDate({ date })
                            }
                        }}
                    />

                    {errors.stockInDate && (
                        <Text style={styles.errorText}>
                            {errors.stockInDate}
                        </Text>
                    )}
                </View>
            </View>

            {/* Row 3: Created by and Description */}
            <View style={styles.row}>
                <View style={styles.inputHalf}>
                    <TextInput
                        dense
                        label="Created by"
                        value={
                            stockInStore.selectedStockIn?.createdBy ||
                            authStore.user?.name ||
                            ''
                        }
                        disabled
                        mode="outlined"
                        style={styles.input}
                    />
                </View>
                <View style={styles.inputHalf}>
                    <TextInput
                        dense
                        label="Approved by"
                        value={stockInStore.selectedStockIn?.approvedBy || ''}
                        disabled
                        mode="outlined"
                        style={styles.input}
                        placeholder="Pending approval"
                    />
                </View>
            </View>

            {/* Row 4: Total Cost and Status */}
            <View style={styles.row}>
                <View style={styles.inputHalf}>
                    <TextInput
                        dense
                        label="Total cost"
                        value={totalAmount}
                        mode="outlined"
                        disabled
                        style={styles.input}
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.inputHalf}>
                    <Menu
                        visible={statusMenuVisible}
                        onDismiss={() => setStatusMenuVisible(false)}
                        anchor={
                            <TextInput
                                dense
                                label="Status"
                                value={
                                    statusOptions.find(s => s.value === status)
                                        ?.label || ''
                                }
                                mode="outlined"
                                disabled
                                style={styles.input}
                                right={
                                    <TextInput.Icon
                                        icon="menu-down"
                                        onPress={() =>
                                            setStatusMenuVisible(true)
                                        }
                                    />
                                }
                                onTouchStart={() => setStatusMenuVisible(true)}
                            />
                        }
                    >
                        {statusOptions.map(option => (
                            <Menu.Item
                                key={option.value}
                                onPress={() => {
                                    setStatus(option.value)
                                    setStatusMenuVisible(false)
                                }}
                                title={option.label}
                            />
                        ))}
                    </Menu>
                </View>
            </View>

            {/* Row 5: Note and Priority */}
            <View style={styles.noteRow}>
                <View style={styles.inputFull}>
                    <TextInput
                        dense
                        label="Note"
                        value={notes}
                        onChangeText={setNotes}
                        mode="outlined"
                        multiline
                        numberOfLines={4}
                        style={[styles.input, styles.noteInput]}
                    />
                </View>
                <View style={styles.priorityContainer}>
                    <View style={styles.priorityButtonsContainer}>
                        <TouchableRipple
                            style={getPriorityButtonStyle(PRIORITY.High)}
                            onPress={() => setPriority(PRIORITY.High)}
                        >
                            <Text style={getPriorityTextStyle(PRIORITY.High)}>
                                {getPriorityDisplayName(PRIORITY.High)}
                            </Text>
                        </TouchableRipple>

                        <TouchableRipple
                            style={getPriorityButtonStyle(PRIORITY.Medium)}
                            onPress={() => setPriority(PRIORITY.Medium)}
                        >
                            <Text style={getPriorityTextStyle(PRIORITY.Medium)}>
                                {getPriorityDisplayName(PRIORITY.Medium)}
                            </Text>
                        </TouchableRipple>

                        <TouchableRipple
                            style={getPriorityButtonStyle(PRIORITY.Low)}
                            onPress={() => setPriority(PRIORITY.Low)}
                        >
                            <Text style={getPriorityTextStyle(PRIORITY.Low)}>
                                {getPriorityDisplayName(PRIORITY.Low)}
                            </Text>
                        </TouchableRipple>
                    </View>
                </View>
            </View>
        </>
    )

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
                    <Appbar.Content title="Edit Stock In" />
                </Appbar.Header>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator
                            size="large"
                            color={theme.theme.colors.primary}
                        />
                        <Text style={styles.loadingText}>
                            Loading stock in details...
                        </Text>
                    </View>
                ) : (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <ScrollView style={styles.scrollView}>
                                {/* Accordion for form info section */}
                                <Surface
                                    style={styles.accordionContainer}
                                    elevation={1}
                                >
                                    <CenteredAccordion
                                        title="Stock In Information"
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

                                {/* Goods List */}
                                <View style={styles.goodsListHeader}>
                                    <Text style={styles.goodsListTitle}>
                                        Goods list
                                    </Text>
                                    <IconButton
                                        icon="plus"
                                        size={24}
                                        onPress={addGoodsItem}
                                        style={styles.addButton}
                                    />
                                </View>

                                {errors.goodsItems && (
                                    <Text style={styles.errorText}>
                                        {errors.goodsItems}
                                    </Text>
                                )}

                                {goodsItems.length === 0 ? (
                                    <Text style={styles.emptyListText}>
                                        No items added yet. Click the + button
                                        to add goods.
                                    </Text>
                                ) : (
                                    goodsItems.map(item => (
                                        <StockInGoodsItem
                                            key={item.goodsId}
                                            item={item}
                                            onRemove={removeGoodsItem}
                                            onUpdate={updateGoodsItem}
                                        />
                                    ))
                                )}

                                {/* Action Button - Update button */}
                                <View style={styles.actionButtons}>
                                    <Button
                                        mode="contained"
                                        onPress={handleUpdate}
                                        style={styles.updateButton}
                                        disabled={isSubmitting}
                                        loading={isSubmitting}
                                    >
                                        Update
                                    </Button>
                                </View>

                                {/* Bottom padding */}
                                <View style={styles.bottomPadding} />
                            </ScrollView>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                )}

                {/* Scanner Modal */}
                <GoodsScannerModal
                    visible={scannerModalVisible}
                    onClose={() => setScannerModalVisible(false)}
                    onSelectGoods={handleGoodsFromScanner}
                    isLoading={isLoading}
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
    priorityContainer: {
        width: 80,
        marginLeft: 12,
        justifyContent: 'center',
    },
    priorityButtonsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        height: 125,
    },
    priorityButton: {
        flex: 1,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 4,
        paddingHorizontal: 2,
    },
    priorityButtonText: {
        fontWeight: 'bold',
        fontSize: 11,
        textAlign: 'center',
    },
    noteInput: {
        height: 125,
    },
    goodsListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    goodsListTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    addButton: {
        margin: 0,
    },
    // Action button styles
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    updateButton: {
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
    errorText: {
        color: '#CF6679',
        fontSize: 12,
        marginLeft: 8,
    },
})

export default withProviders(
    StockInStoreProvider,
    MasterDataStoreProvider,
    AuthStoreProvider
)(StockInEditScreen)
