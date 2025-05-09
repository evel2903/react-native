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
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore'
import { useMasterDataStore } from '@/src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore'
import { withProviders } from '@/src/Core/Presentation/Utils/WithProviders'
import { StockInStoreProvider } from '../Stores/StockInStore/StockInStoreProvider'
import { MasterDataStoreProvider } from '@/src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreProvider'
import { useTheme } from '@/src/Core/Presentation/Theme/ThemeProvider'
import { Status, getStatusDisplayName } from '@/src/Common/Domain/Enums/Status'
import { useAuthStore } from '@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore'
import { AuthStoreProvider } from '@/src/Auth/Presentation/Stores/AuthStore/AuthStoreProvider'
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

// Read-only version of the goods item component
const ReadOnlyGoodsItem = ({ item }: any) => (
    <Surface style={styles.goodsItemCard} elevation={1}>
        <View style={styles.goodsItemHeader}>
            <View style={styles.goodsItemCodeSection}>
                <TextInput
                    dense
                    value={item.goodsCode}
                    mode="outlined"
                    editable={false}
                    style={styles.goodsCodeInput}
                />
            </View>
        </View>

        <Text style={styles.goodsName}>{item.goodsName}</Text>

        <View style={styles.goodsItemRow}>
            <TextInput
                dense
                label="Expiry date"
                value={formatDate(item.expiryDate)}
                mode="outlined"
                style={styles.goodsItemFullInput}
                editable={false}
            />
        </View>

        <View style={styles.goodsItemRow}>
            <TextInput
                dense
                label="Quantity"
                value={item.quantity.toString()}
                mode="outlined"
                editable={false}
                style={styles.goodsItemHalfInput}
            />
            <TextInput
                dense
                label="Cost"
                value={formatCurrency(item.price)}
                mode="outlined"
                editable={false}
                style={styles.goodsItemHalfInput}
            />
        </View>

        {item.notes && (
            <View style={styles.goodsItemRow}>
                <TextInput
                    dense
                    label="Note"
                    value={item.notes}
                    mode="outlined"
                    multiline
                    editable={false}
                    numberOfLines={2}
                    style={styles.goodsItemFullInput}
                />
            </View>
        )}
    </Surface>
)

type StockInViewScreenRouteProp = RouteProp<RootStackParamList, 'StockInView'>

const StockInViewScreen = observer(() => {
    const navigation = useNavigation<RootScreenNavigationProp<'StockIn'>>()
    const route = useRoute<StockInViewScreenRouteProp>()
    const stockInStore = useStockInStore()
    const masterDataStore = useMasterDataStore()
    const authStore = useAuthStore()
    const theme = useTheme()

    // Get stock ID from route params
    const stockId = route.params?.id

    // States
    const [infoExpanded, setInfoExpanded] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')

    // Fetch stock data when component mounts
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
                    const success = await stockInStore.getStockInDetails(
                        stockId
                    )
                    if (!success) {
                        showSnackbar('Failed to load stock in details')
                    }
                } else {
                    showSnackbar('No stock ID provided')
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
            stockInStore.selectedStockIn &&
            stockInStore.selectedStockIn.priority === priorityValue
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
            stockInStore.selectedStockIn &&
            stockInStore.selectedStockIn.priority === priorityValue
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
        const stockInData = stockInStore.selectedStockIn

        if (!stockInData) return null

        return (
            <>
                {/* Row 1: Code and Supplier */}
                <View style={styles.row}>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Code"
                            editable={false}
                            value={stockInData?.code || ''}
                            mode="outlined"
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Supplier"
                            value={
                                stockInData?.supplier?.name ||
                                masterDataStore.suppliers.data.find(
                                    s => s.id === stockInData?.supplierId
                                )?.name ||
                                ''
                            }
                            mode="outlined"
                            style={styles.input}
                            editable={false}
                        />
                    </View>
                </View>

                {/* Row 2: Lot Number and Stock In Date */}
                <View style={styles.row}>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Lot number"
                            value={stockInData?.lotNumber || ''}
                            mode="outlined"
                            style={styles.input}
                            editable={false}
                        />
                    </View>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Stock in date"
                            value={
                                stockInData?.inDate
                                    ? formatDate(stockInData.inDate)
                                    : ''
                            }
                            mode="outlined"
                            style={styles.input}
                            editable={false}
                        />
                    </View>
                </View>

                {/* Row 3: Created by and Approved by */}
                <View style={styles.row}>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Created by"
                            value={stockInData?.createdBy || ''}
                            editable={false}
                            mode="outlined"
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Approved by"
                            value={stockInData?.approvedBy || ''}
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
                        <TextInput
                            dense
                            label="Total cost"
                            value={formatCurrency(
                                stockInData?.totalAmount || '0'
                            )}
                            mode="outlined"
                            editable={false}
                            style={styles.input}
                        />
                    </View>
                    <View style={styles.inputHalf}>
                        <TextInput
                            dense
                            label="Status"
                            value={getStatusDisplayName(
                                stockInData?.status as Status
                            )}
                            mode="outlined"
                            editable={false}
                            style={styles.input}
                        />
                    </View>
                </View>

                {/* Row 5: Note and Priority */}
                <View style={styles.noteRow}>
                    <View style={styles.inputFull}>
                        <TextInput
                            dense
                            label="Note"
                            value={stockInData?.notes || ''}
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            style={[styles.input, styles.noteInput]}
                            editable={false}
                        />
                    </View>
                    <View style={styles.priorityContainer}>
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
                                    {getPriorityDisplayName(PRIORITY.Medium)}
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
                    <Appbar.Content title="View Stock In" />
                </Appbar.Header>

                {isLoading || !stockInStore.selectedStockIn ? (
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
                            </View>

                            {!stockInStore.selectedStockIn?.details ||
                            stockInStore.selectedStockIn.details.length ===
                                0 ? (
                                <Text style={styles.emptyListText}>
                                    No items in this stock in record.
                                </Text>
                            ) : (
                                stockInStore.selectedStockIn.details.map(
                                    item => (
                                        <ReadOnlyGoodsItem
                                            key={item.id}
                                            item={item}
                                        />
                                    )
                                )
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
    // Goods item styles
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
    goodsCodeInput: {
        flex: 1,
        marginRight: 8,
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
})

export default withProviders(
    StockInStoreProvider,
    MasterDataStoreProvider,
    AuthStoreProvider
)(StockInViewScreen)
