import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Alert,
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
    Title,
} from 'react-native-paper'
import { formatDate} from '@/src/Core/Utils';
import { DatePickerModal } from 'react-native-paper-dates'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'
import { RootScreenNavigationProp } from '@/src/Core/Presentation/Navigation/Types/Index'
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
import { PRIORITY, getPriorityDisplayName } from '@/src/Common/Domain/Enums/Priority'

interface GoodsItem {
    goodsId: string
    goodsCode: string
    goodsName: string
    quantity: number
    price: number
    expiryDate: string
    notes: string
}

const StockInAddScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'StockIn'>>()
    const stockInStore = useStockInStore()
    const masterDataStore = useMasterDataStore()
    const authStore = useAuthStore()
    const theme = useTheme()

    // Form state
    const [code, setCode] = useState('')
    const [supplierId, setSupplierId] = useState('')
    const [lotNumber, setLotNumber] = useState('')
    const [stockInDate, setStockInDate] = useState(
        new Date().toISOString().split('T')[0]
    )
    const [description, setDescription] = useState('')
    const [totalAmount, setTotalAmount] = useState('0')
    const [status, setStatus] = useState(Status.Draft)
    const [notes, setNotes] = useState('')
    const [priority, setPriority] = useState(2) // Default to Medium priority

    // Goods list
    const [goodsItems, setGoodsItems] = useState<GoodsItem[]>([])
    const [currentItem, setCurrentItem] = useState<GoodsItem | null>(null)
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null)

    // Date picker states
    const [stockInDatePickerVisible, setStockInDatePickerVisible] = useState(false)
    const [expiryDatePickerVisible, setExpiryDatePickerVisible] = useState(false)
    const [selectedStockInDate, setSelectedStockInDate] = useState(new Date())
    const [selectedExpiryDate, setSelectedExpiryDate] = useState(new Date())

    // UI state
    const [supplierMenuVisible, setSupplierMenuVisible] = useState(false)
    const [statusMenuVisible, setStatusMenuVisible] = useState(false)
    const [goodsMenuVisible, setGoodsMenuVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Load master data when component mounts
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                await Promise.all([
                    masterDataStore.loadSuppliers(),
                    masterDataStore.loadGoods(),
                    masterDataStore.loadUnits(),
                ])
            } catch (error) {
                showSnackbar('Failed to load master data')
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

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

    // Handle expiry date confirmation
    const onConfirmExpiryDate = ({ date }: { date: Date }) => {
        setSelectedExpiryDate(date)
        if (currentItem && currentItemIndex !== null) {
            // Updating existing item
            updateGoodsItem(currentItem.goodsId, 'expiryDate', date.toISOString())
        } else if (currentItem) {
            // For new item that hasn't been added yet
            setCurrentItem({
                ...currentItem,
                expiryDate: date.toISOString()
            })
        }
        setExpiryDatePickerVisible(false)
    }

    const addGoodsItem = () => {
        resetGoodsItemForm()
        setGoodsMenuVisible(true)
    }

    const editGoodsItem = (index: number) => {
        const item = goodsItems[index]
        setCurrentItem(item)
        setCurrentItemIndex(index)
        setSelectedExpiryDate(new Date(item.expiryDate))
    }

    const selectGoods = (goodsId: string) => {
        const goods = masterDataStore.goods.data.find(g => g.id === goodsId)

        if (goods && currentItem) {
            const updatedItem = {
                ...currentItem,
                goodsId: goods.id,
                goodsCode: goods.code,
                goodsName: goods.name,
            }
            
            setCurrentItem(updatedItem)

            // Add the goods to the list if not editing an existing item
            if (currentItemIndex === null) {
                setGoodsItems([...goodsItems, updatedItem])
            }
        }

        setGoodsMenuVisible(false)
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

    const handleSave = async () => {
        if (!validateForm()) {
            showSnackbar('Please fill in all required fields')
            return
        }

        setIsLoading(true)

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
                    goodsId: item.goodsId,
                    goodsCode: item.goodsCode,
                    goodsName: item.goodsName,
                    quantity: item.quantity,
                    price: item.price,
                    expiryDate: item.expiryDate,
                    notes: item.notes,
                })),
            }

            // Call store to save data
            const result = await stockInStore.createStockIn(payload)

            if (result) {
                showSnackbar('Stock in created successfully')
                setTimeout(() => {
                    navigation.goBack()
                }, 1500)
            } else {
                showSnackbar('Failed to create stock in')
            }
        } catch (error) {
            console.error('Error creating stock in:', error)
            showSnackbar('An error occurred while creating stock in')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRequest = () => {
        // Change status to PENDING and save
        setStatus(Status.Pending)
        setTimeout(() => {
            handleSave()
        }, 100)
    }

    // Priority styles based on value
    const getPriorityButtonStyle = (priorityValue: number) => {
        const isSelected = priorityValue === priority;
        const baseStyles = [
            styles.priorityButton,
            {
                backgroundColor: isSelected ? 
                    (priorityValue === PRIORITY.High ? '#ff5252' : 
                     priorityValue === PRIORITY.Medium ? '#fb8c00' : 
                     '#4caf50') : 
                    'transparent',
                borderWidth: 1,
                borderColor: priorityValue === PRIORITY.High ? '#ff5252' : 
                             priorityValue === PRIORITY.Medium ? '#fb8c00' : 
                             '#4caf50'
            }
        ];
        
        return baseStyles;
    }
    
    // Get text style based on selection state
    const getPriorityTextStyle = (priorityValue: number) => {
        const isSelected = priorityValue === priority;
        return [
            styles.priorityButtonText,
            {
                color: isSelected ? 'white' : 
                      (priorityValue === PRIORITY.High ? '#ff5252' : 
                       priorityValue === PRIORITY.Medium ? '#fb8c00' : 
                       '#4caf50')
            }
        ];
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
                    <Appbar.Content title="New Stock In" />
                </Appbar.Header>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView style={styles.scrollView}>
                            <Surface style={styles.formCard} elevation={1}>
                                {/* Row 1: Code and Supplier */}
                                <View style={styles.row}>
                                    <View style={styles.inputHalf}>
                                        <TextInput dense
                                            label="Code"
                                            value={code}
                                            onChangeText={setCode}
                                            mode="outlined"
                                            style={styles.input}
                                            placeholder="Auto-generated"
                                        />
                                    </View>
                                    <View style={styles.inputHalf}>
                                        <Menu
                                            visible={supplierMenuVisible}
                                            onDismiss={() =>
                                                setSupplierMenuVisible(false)
                                            }
                                            anchor={
                                                <TextInput dense
                                                    label="Supplier"
                                                    value={
                                                        supplierId
                                                            ? masterDataStore.suppliers.data.find(
                                                                  s =>
                                                                      s.id ===
                                                                      supplierId
                                                              )?.name ||
                                                              ''
                                                            : ''
                                                    }
                                                    placeholder="Select Supplier"
                                                    mode="outlined"
                                                    style={styles.input}
                                                    editable={false}
                                                    error={!!errors.supplierId}
                                                    right={<TextInput.Icon icon="menu-down" onPress={() => setSupplierMenuVisible(true)} />}
                                                    onTouchStart={() => setSupplierMenuVisible(true)}
                                                />
                                            }
                                        >
                                            {masterDataStore.suppliers.data
                                                .filter(
                                                    s =>
                                                        s.isActive &&
                                                        !s.isDeleted
                                                )
                                                .map(s => (
                                                    <Menu.Item
                                                        key={s.id}
                                                        onPress={() => {
                                                            setSupplierId(s.id)
                                                            setSupplierMenuVisible(
                                                                false
                                                            )
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
                                        <TextInput dense
                                            label="Lot number"
                                            value={lotNumber}
                                            onChangeText={setLotNumber}
                                            mode="outlined"
                                            style={styles.input}
                                        />
                                    </View>
                                    <View style={styles.inputHalf}>
                                        {/* Date picker as TextInput */}
                                        <TextInput dense
                                            label="Stock in date"
                                            value={formatDate(stockInDate)}
                                            mode="outlined"
                                            style={styles.input}
                                            editable={false}
                                            error={!!errors.stockInDate}
                                            right={<TextInput.Icon icon="calendar" onPress={() => setStockInDatePickerVisible(true)} />}
                                            onTouchStart={() => setStockInDatePickerVisible(true)}
                                        />
                                        
                                        {/* Stock In Date Picker Modal */}
                                        <DatePickerModal
                                            locale="en"
                                            mode="single"
                                            visible={stockInDatePickerVisible}
                                            onDismiss={() => setStockInDatePickerVisible(false)}
                                            date={selectedStockInDate}
                                            onConfirm={onConfirmStockInDate}
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
                                        <TextInput dense
                                            label="Created by"
                                            value={authStore.user?.name || ''}
                                            editable={false}
                                            mode="outlined"
                                            style={styles.input}
                                        />
                                    </View>
                                    <View style={styles.inputHalf}>
                                        <TextInput dense
                                            label="Approved by"
                                            value=""
                                            editable={false}
                                            mode="outlined"
                                            style={styles.input}
                                            placeholder="Pending approval"
                                        />
                                    </View>
                                </View>

                                {/* Row 4: Total Cost and Status */}
                                <View style={styles.row}>
                                    <View style={styles.inputHalf}>
                                        <TextInput dense
                                            label="Total cost"
                                            value={totalAmount}
                                            onChangeText={setTotalAmount}
                                            mode="outlined"
                                            editable={false}
                                            style={styles.input}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={styles.inputHalf}>
                                        <Menu
                                            visible={statusMenuVisible}
                                            onDismiss={() =>
                                                setStatusMenuVisible(false)
                                            }
                                            anchor={
                                                <TextInput dense
                                                    label="Status"
                                                    value={status}
                                                    mode="outlined"
                                                    editable={false}
                                                    style={styles.input}
                                                    right={<TextInput.Icon icon="menu-down" onPress={() => setStatusMenuVisible(true)} />}
                                                    onTouchStart={() => setStatusMenuVisible(true)}
                                                />
                                            }
                                        >
                                            <Menu.Item
                                                onPress={() => {
                                                    setStatus(Status.Draft)
                                                    setStatusMenuVisible(false)
                                                }}
                                                title="DRAFT"
                                            />
                                            <Menu.Item
                                                onPress={() => {
                                                    setStatus(Status.Pending)
                                                    setStatusMenuVisible(false)
                                                }}
                                                title="PENDING"
                                            />
                                        </Menu>
                                    </View>
                                </View>

                                {/* Row 5: Note and Priority */}
                                <View style={styles.noteRow}>
                                    <View style={styles.inputFull}>
                                        <TextInput dense
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
                                    No items added yet. Click the + button to
                                    add goods.
                                </Text>
                            ) : (
                                goodsItems.map((item, index) => (
                                    <Surface
                                        key={item.goodsId}
                                        style={styles.goodsItemCard}
                                        elevation={1}
                                    >
                                        <View style={styles.goodsItemHeader}>
                                            <View
                                                style={
                                                    styles.goodsItemCodeSection
                                                }
                                            >
                                                <TextInput dense
                                                    value={item.goodsCode}
                                                    mode="outlined"
                                                    editable={false}
                                                    style={
                                                        styles.goodsCodeInput
                                                    }
                                                />
                                                <IconButton
                                                    icon="barcode-scan"
                                                    size={24}
                                                    onPress={() => {}}
                                                    style={styles.scanButton}
                                                />
                                            </View>
                                            <View style={styles.goodsItemActions}>
                                                <IconButton
                                                    icon="pencil"
                                                    size={20}
                                                    onPress={() => editGoodsItem(index)}
                                                    style={styles.editButton}
                                                />
                                                <IconButton
                                                    icon="close"
                                                    size={20}
                                                    onPress={() =>
                                                        removeGoodsItem(
                                                            item.goodsId
                                                        )
                                                    }
                                                />
                                            </View>
                                        </View>

                                        <Text style={styles.goodsName}>
                                            {item.goodsName}
                                        </Text>

                                        <View style={styles.goodsItemRow}>
                                            {/* Expiry date as TextInput */}
                                            <TextInput dense
                                                label="Expiry date"
                                                value={formatDate(item.expiryDate)}
                                                mode="outlined"
                                                style={styles.goodsItemFullInput}
                                                editable={false}
                                                right={<TextInput.Icon icon="calendar" onPress={() => {
                                                    setCurrentItem(item);
                                                    setCurrentItemIndex(index);
                                                    setSelectedExpiryDate(new Date(item.expiryDate));
                                                    setExpiryDatePickerVisible(true);
                                                }} />}
                                                onTouchStart={() => {
                                                    setCurrentItem(item);
                                                    setCurrentItemIndex(index);
                                                    setSelectedExpiryDate(new Date(item.expiryDate));
                                                    setExpiryDatePickerVisible(true);
                                                }}
                                            />
                                            
                                            {/* Expiry Date Picker Modal */}
                                            <DatePickerModal
                                                locale="en"
                                                mode="single"
                                                visible={expiryDatePickerVisible}
                                                onDismiss={() => setExpiryDatePickerVisible(false)}
                                                date={selectedExpiryDate}
                                                onConfirm={onConfirmExpiryDate}
                                            />
                                        </View>

                                        <View style={styles.goodsItemRow}>
                                            <TextInput dense
                                                label="Quantity"
                                                value={item.quantity.toString()}
                                                onChangeText={value => {
                                                    const numValue =
                                                        parseFloat(value) || 0
                                                    updateGoodsItem(
                                                        item.goodsId,
                                                        'quantity',
                                                        numValue
                                                    )
                                                }}
                                                mode="outlined"
                                                keyboardType="numeric"
                                                style={
                                                    styles.goodsItemHalfInput
                                                }
                                            />
                                            <TextInput dense
                                                label="Cost"
                                                value={item.price.toString()}
                                                onChangeText={value => {
                                                    const numValue =
                                                        parseFloat(value) || 0
                                                    updateGoodsItem(
                                                        item.goodsId,
                                                        'price',
                                                        numValue
                                                    )
                                                }}
                                                mode="outlined"
                                                keyboardType="numeric"
                                                style={
                                                    styles.goodsItemHalfInput
                                                }
                                            />
                                        </View>

                                        <View style={styles.goodsItemRow}>
                                            <TextInput dense
                                                label="Note"
                                                value={item.notes}
                                                onChangeText={value =>
                                                    updateGoodsItem(
                                                        item.goodsId,
                                                        'notes',
                                                        value
                                                    )
                                                }
                                                mode="outlined"
                                                multiline
                                                numberOfLines={2}
                                                style={
                                                    styles.goodsItemFullInput
                                                }
                                            />
                                        </View>
                                    </Surface>
                                ))
                            )}

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <Button
                                    mode="outlined"
                                    onPress={handleSave}
                                    style={styles.actionButton}
                                    disabled={isLoading}
                                >
                                    Save/Edit
                                </Button>
                                <Button
                                    mode="contained"
                                    onPress={handleRequest}
                                    style={styles.actionButton}
                                    disabled={isLoading}
                                >
                                    Request
                                </Button>
                            </View>

                            {/* Bottom padding */}
                            <View style={styles.bottomPadding} />
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>

                {/* Select Goods Dialog */}
                <Menu
                    visible={goodsMenuVisible}
                    onDismiss={() => setGoodsMenuVisible(false)}
                    anchor={{ x: 0, y: 0 }}
                    style={styles.goodsMenu}
                >
                    <ScrollView style={styles.goodsMenuScroll}>
                        {masterDataStore.goods.data
                            .filter(g => g.isActive && !g.isDeleted)
                            .map(goods => (
                                <Menu.Item
                                    key={goods.id}
                                    onPress={() => selectGoods(goods.id)}
                                    title={`${goods.name} (${goods.code})`}
                                />
                            ))}
                    </ScrollView>
                </Menu>

                {/* Loading indicator */}
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" />
                    </View>
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
    formCard: {
        padding: 12,
        borderRadius: 8,
    },
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
    dropdown: {
        flex: 1,
    },
    // Priority styles
    priorityContainer: {
        width: 80, // Reduced width to minimum
        marginLeft: 12,
        justifyContent: 'center',
    },
    priorityButtonsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        height: 125, // Match the height of the note input with 4 lines
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
        height: 125, // Match the height of priority buttons container
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
    goodsItemCard: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    goodsItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goodsItemCodeSection: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    goodsItemActions: {
        flexDirection: 'row',
    },
    goodsCodeInput: {
        flex: 1,
        marginRight: 8,
    },
    scanButton: {
        margin: 0,
    },
    editButton: {
        margin: 0,
    },
    goodsName: {
        marginVertical: 4,
        marginLeft: 4,
    },
    goodsItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    goodsItemFullInput: {
        flex: 1,
    },
    goodsItemHalfInput: {
        width: '48%',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 8,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
    },
    bottomPadding: {
        height: 40,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    goodsMenu: {
        width: '80%',
        maxHeight: 300,
        marginHorizontal: '10%',
        marginTop: 100,
    },
    goodsMenuScroll: {
        maxHeight: 250,
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

export default withProviders([
    StockInStoreProvider,
    MasterDataStoreProvider,
    AuthStoreProvider,
])(StockInAddScreen)