import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, IconButton, Text, Surface } from 'react-native-paper'
import { DatePickerModal } from 'react-native-paper-dates'
import { formatDate } from '@/src/Core/Utils'

interface GoodsItem {
    goodsId: string
    goodsCode: string
    goodsName: string
    quantity: number
    price: number
    expiryDate: string
    notes: string
}

interface StockInGoodsItemProps {
    item: GoodsItem
    onRemove: (goodsId: string) => void
    onUpdate: (goodsId: string, field: keyof GoodsItem, value: string | number) => void
}

const StockInGoodsItem: React.FC<StockInGoodsItemProps> = ({
    item,
    onRemove,
    onUpdate,
}) => {
    const [expiryDatePickerVisible, setExpiryDatePickerVisible] = useState(false)
    const [selectedExpiryDate, setSelectedExpiryDate] = useState(new Date(item.expiryDate))

    // Handle expiry date confirmation
    const onConfirmExpiryDate = ({ date }: { date: Date }) => {
        setSelectedExpiryDate(date)
        onUpdate(item.goodsId, 'expiryDate', date.toISOString())
        setExpiryDatePickerVisible(false)
    }

    return (
        <Surface style={styles.goodsItemCard} elevation={1}>
            <View style={styles.goodsItemHeader}>
                <View style={styles.goodsItemCodeSection}>
                    <TextInput dense
                        value={item.goodsCode}
                        mode="outlined"
                        editable={false}
                        style={styles.goodsCodeInput}
                    />
                </View>
                <View style={styles.goodsItemActions}>
                    <IconButton
                        icon="close"
                        size={20}
                        onPress={() => onRemove(item.goodsId)}
                    />
                </View>
            </View>

            <Text style={styles.goodsName}>{item.goodsName}</Text>

            <View style={styles.goodsItemRow}>
                {/* Expiry date as TextInput */}
                <TextInput dense
                    label="Expiry date"
                    value={formatDate(item.expiryDate)}
                    mode="outlined"
                    style={styles.goodsItemFullInput}
                    editable={false}
                    right={<TextInput.Icon icon="calendar" onPress={() => setExpiryDatePickerVisible(true)} />}
                    onTouchStart={() => setExpiryDatePickerVisible(true)}
                />
                
                {/* Expiry Date Picker Modal */}
                <DatePickerModal
                    locale="en"
                    mode="single"
                    visible={expiryDatePickerVisible}
                    onDismiss={() => setExpiryDatePickerVisible(false)}
                    date={selectedExpiryDate}
                    onConfirm={({ date }) => {
                        if (date) {
                            onConfirmExpiryDate({ date });
                        }
                    }}
                />
            </View>

            <View style={styles.goodsItemRow}>
                <TextInput dense
                    label="Quantity"
                    value={item.quantity.toString()}
                    onChangeText={value => {
                        const numValue = parseFloat(value) || 0
                        onUpdate(item.goodsId, 'quantity', numValue)
                    }}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.goodsItemHalfInput}
                />
                <TextInput dense
                    label="Cost"
                    value={item.price.toString()}
                    onChangeText={value => {
                        const numValue = parseFloat(value) || 0
                        onUpdate(item.goodsId, 'price', numValue)
                    }}
                    mode="outlined"
                    keyboardType="numeric"
                    style={styles.goodsItemHalfInput}
                />
            </View>

            <View style={styles.goodsItemRow}>
                <TextInput dense
                    label="Note"
                    value={item.notes}
                    onChangeText={value => onUpdate(item.goodsId, 'notes', value)}
                    mode="outlined"
                    multiline
                    numberOfLines={2}
                    style={styles.goodsItemFullInput}
                />
            </View>
        </Surface>
    )
}

const styles = StyleSheet.create({
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
})

export default StockInGoodsItem