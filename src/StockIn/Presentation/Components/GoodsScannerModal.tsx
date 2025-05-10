import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native'
import {
    Button,
    Text,
    TextInput,
    Surface,
    IconButton,
    ActivityIndicator,
} from 'react-native-paper'
import { CameraView, Camera } from 'expo-camera'
import { GoodsEntity } from '@/src/Common/Domain/Entities/GoodsEntity'
import { useMasterDataStore } from '@/src/Common/Presentation/Stores/MasterDataStore/UseMasterDataStore'

interface GoodsScannerModalProps {
    visible: boolean
    onClose: () => void
    onSelectGoods: (goods: GoodsEntity) => void
    isLoading: boolean
}

const GoodsScannerModal: React.FC<GoodsScannerModalProps> = ({
    visible,
    onClose,
    onSelectGoods,
    isLoading,
}) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)
    const [scanMode, setScanMode] = useState(true) // Changed to true to default to scanner mode
    const [scannedData, setScannedData] = useState<string | null>(null)
    const [searchCode, setSearchCode] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [foundGoods, setFoundGoods] = useState<GoodsEntity | null>(null)
    const [scannerActive, setScannerActive] = useState(true)
    const [searchLoading, setSearchLoading] = useState(false)

    // Get the master data store for API calls
    const masterDataStore = useMasterDataStore()

    // Request camera permissions when component mounts
    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync()
            setHasPermission(status === 'granted')
        }

        getCameraPermissions()
    }, [])

    // Reset state when modal is shown
    useEffect(() => {
        if (visible) {
            setSearchCode('')
            setScannedData(null)
            setErrorMessage(null)
            setFoundGoods(null)
            setScannerActive(true)
            setScanMode(true) // Added to ensure scanner mode is active when modal opens
        }
    }, [visible])

    // Handle barcode scanning
    const handleBarcodeScanned = ({
        type,
        data,
    }: {
        type: string
        data: string
    }) => {
        setScannerActive(false)
        setScannedData(data)

        // If data is empty, show error
        if (!data || data.trim().length === 0) {
            setErrorMessage('Empty scan result')
            return
        }

        // Extract code using regex even if JSON parsing fails
        let goodsCode = null

        // Check if data appears to be JSON (starts with { and ends with })
        if (data.trim().startsWith('{') && data.trim().endsWith('}')) {
            try {
                // Try standard JSON parsing first
                const parsedData = JSON.parse(data)
                if (parsedData && parsedData.code) {
                    goodsCode = parsedData.code
                }
            } catch (error) {
                console.log(
                    'JSON parsing failed, trying regex extraction:',
                    error
                )

                // If JSON parsing fails, try to extract the code using regex
                try {
                    const codeMatch = data.match(/"code"\s*:\s*"([^"]+)"/)
                    if (codeMatch && codeMatch[1]) {
                        goodsCode = codeMatch[1]
                        console.log('Extracted code using regex:', goodsCode)
                    }
                } catch (regexError) {
                    console.log('Regex extraction failed:', regexError)
                }
            }
        } else {
            // If not JSON format, use the data as direct code
            goodsCode = data.trim()
        }

        // If we managed to extract a code, search for it
        if (goodsCode) {
            searchGoodsByCode(goodsCode)
        } else {
            setErrorMessage('Could not extract a valid code from scan')
        }
    }

    // Find goods based on QR data
    const findGoodsByQrData = async (qrData: {
        code?: string
        name?: string
    }) => {
        setSearchLoading(true)
        setErrorMessage(null)

        try {
            // If code is present, search by code using API
            if (qrData.code) {
                const goods = await masterDataStore.getGoodsByCode(qrData.code)

                if (goods) {
                    setFoundGoods(goods)
                    return
                }
            }

            // If name is present but no goods found by code, show error
            if (qrData.name) {
                setErrorMessage(`No goods found with name: ${qrData.name}`)
                return
            }

            // If no matching goods found
            setErrorMessage('No matching goods found')
        } catch (error) {
            console.error('Error finding goods:', error)
            setErrorMessage('Error searching for goods')
        } finally {
            setSearchLoading(false)
        }
    }

    // Search for goods by code using API
    const searchGoodsByCode = async (code: string) => {
        if (!code.trim()) {
            setErrorMessage('Please enter a code')
            return
        }

        setSearchLoading(true)
        setErrorMessage(null)

        try {
            const goods = await masterDataStore.getGoodsByCode(code)

            if (goods) {
                setFoundGoods(goods)
            } else {
                setErrorMessage('No goods found with this code')
            }
        } catch (error) {
            console.error('Error searching goods:', error)
            setErrorMessage('Error searching for goods')
        } finally {
            setSearchLoading(false)
        }
    }

    // Handle manual search
    const handleSearch = () => {
        searchGoodsByCode(searchCode)
    }

    // Select the found goods
    const handleSelectGoods = () => {
        if (foundGoods) {
            onSelectGoods(foundGoods)
        }
    }

    // Switch between manual and scanner modes
    const toggleScanMode = () => {
        setScanMode(!scanMode)
        // Reset states when switching modes
        setSearchCode('')
        setScannedData(null)
        setErrorMessage(null)
        setFoundGoods(null)
        setScannerActive(true)
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <Surface style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text variant="titleMedium">
                            {scanMode
                                ? 'Scan Goods QR Code'
                                : 'Find Goods by Code'}
                        </Text>
                        <IconButton icon="close" size={24} onPress={onClose} />
                    </View>

                    {/* Loading indicator */}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" />
                            <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                    )}

                    {!isLoading && (
                        <>
                            {/* Toggle between manual entry and scanner */}
                            <Button
                                mode="outlined"
                                icon={scanMode ? 'keyboard' : 'qrcode-scan'}
                                onPress={toggleScanMode}
                                style={styles.toggleButton}
                            >
                                {scanMode
                                    ? 'Type Code Manually'
                                    : 'Scan QR Code'}
                            </Button>

                            {/* Manual code entry mode */}
                            {!scanMode && (
                                <View style={styles.manualEntryContainer}>
                                    <TextInput
                                        label="Goods Code"
                                        value={searchCode}
                                        onChangeText={setSearchCode}
                                        mode="outlined"
                                        style={styles.input}
                                        autoCapitalize="none"
                                        right={
                                            <TextInput.Icon
                                                icon="magnify"
                                                onPress={handleSearch}
                                            />
                                        }
                                    />
                                    <Button
                                        mode="contained"
                                        onPress={handleSearch}
                                        style={styles.searchButton}
                                        loading={searchLoading}
                                        disabled={searchLoading}
                                    >
                                        Search
                                    </Button>
                                </View>
                            )}

                            {/* QR scanner mode */}
                            {scanMode && (
                                <View style={styles.scannerContainer}>
                                    {hasPermission === null && (
                                        <Text>
                                            Requesting for camera permission...
                                        </Text>
                                    )}

                                    {hasPermission === false && (
                                        <Text>
                                            No access to camera. Please enable
                                            camera permissions.
                                        </Text>
                                    )}

                                    {hasPermission === true &&
                                        scannerActive &&
                                        !searchLoading && (
                                            <View
                                                style={styles.cameraContainer}
                                            >
                                                <CameraView
                                                    onBarcodeScanned={
                                                        scannerActive
                                                            ? handleBarcodeScanned
                                                            : undefined
                                                    }
                                                    barcodeScannerSettings={{
                                                        barcodeTypes: [
                                                            'qr',
                                                            'code128',
                                                            'code39',
                                                            'code93',
                                                            'ean13',
                                                            'ean8',
                                                            'pdf417',
                                                        ],
                                                    }}
                                                    style={styles.scanner}
                                                />
                                                <View
                                                    style={
                                                        styles.scannerOverlay
                                                    }
                                                >
                                                    <View
                                                        style={
                                                            styles.scannerTargetBox
                                                        }
                                                    />
                                                </View>
                                                <Text
                                                    style={
                                                        styles.scanInstructionText
                                                    }
                                                >
                                                    Position QR code or barcode
                                                    within the box
                                                </Text>
                                            </View>
                                        )}

                                    {scannedData &&
                                        !scannerActive &&
                                        !searchLoading && (
                                            <View
                                                style={
                                                    styles.scannedDataContainer
                                                }
                                            >
                                                <Button
                                                    mode="text"
                                                    onPress={() => {
                                                        setScannedData(null)
                                                        setScannerActive(true)
                                                    }}
                                                >
                                                    Scan Again
                                                </Button>
                                            </View>
                                        )}

                                    {searchLoading && (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator size="large" />
                                            <Text style={styles.loadingText}>
                                                Searching...
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Error message */}
                            {errorMessage && (
                                <Text style={styles.errorText}>
                                    {errorMessage}
                                </Text>
                            )}

                            {/* Found goods details */}
                            {foundGoods && (
                                <Surface
                                    style={styles.foundGoodsContainer}
                                    elevation={3}
                                >
                                    <Text variant="titleSmall">
                                        Found Goods:
                                    </Text>
                                    <Text style={styles.goodsDetail}>
                                        Code: {foundGoods.code}
                                    </Text>
                                    <Text style={styles.goodsDetail}>
                                        Name: {foundGoods.name}
                                    </Text>
                                    {foundGoods.customCode && (
                                        <Text style={styles.goodsDetail}>
                                            Custom Code: {foundGoods.customCode}
                                        </Text>
                                    )}
                                    {foundGoods.category && (
                                        <Text style={styles.goodsDetail}>
                                            Category: {foundGoods.category.name}
                                        </Text>
                                    )}
                                    {foundGoods.unit && (
                                        <Text style={styles.goodsDetail}>
                                            Unit: {foundGoods.unit.name}
                                        </Text>
                                    )}
                                    <Button
                                        mode="contained"
                                        onPress={handleSelectGoods}
                                        style={styles.selectButton}
                                    >
                                        Select This Product
                                    </Button>
                                </Surface>
                            )}
                        </>
                    )}
                </Surface>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 8,
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    toggleButton: {
        marginBottom: 16,
    },
    manualEntryContainer: {
        marginBottom: 16,
    },
    input: {
        marginBottom: 8,
    },
    searchButton: {
        marginTop: 8,
    },
    scannerContainer: {
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
    },
    cameraContainer: {
        width: '100%',
        height: 300,
        overflow: 'hidden',
        borderRadius: 8,
        position: 'relative',
    },
    scanner: {
        width: '100%',
        height: '100%',
    },
    scannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerTargetBox: {
        width: 200,
        height: 200,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: 'transparent',
    },
    scanInstructionText: {
        color: '#fff',
        position: 'absolute',
        bottom: 20,
        width: '100%',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
    },
    scannedDataContainer: {
        marginVertical: 16,
        alignItems: 'center',
    },
    errorText: {
        color: '#CF6679',
        marginVertical: 8,
    },
    foundGoodsContainer: {
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    goodsDetail: {
        marginBottom: 8,
    },
    selectButton: {
        marginTop: 8,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 8,
    },
})

export default GoodsScannerModal
