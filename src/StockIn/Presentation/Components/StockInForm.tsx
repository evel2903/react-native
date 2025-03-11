import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText, Menu, Dialog, Portal } from 'react-native-paper';
import { observer } from 'mobx-react';
import { useStockInStore } from '../Stores/StockInStore/UseStockInStore';
import CreateStockInPayload from '../../Application/Types/CreateStockInPayload';

interface StockInFormProps {
  onCancel: () => void;
}

const StockInForm = observer(({ onCancel }: StockInFormProps) => {
  const stockInStore = useStockInStore();
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dialogVisible, setDialogVisible] = useState(false);

  const unitOptions = ['pc', 'kg', 'liter', 'box', 'carton', 'pallet'];
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!stockInStore.formData.productId) {
      newErrors.productId = 'Product ID is required';
    }

    if (!stockInStore.formData.productName) {
      newErrors.productName = 'Product name is required';
    }

    if (!stockInStore.formData.quantity || stockInStore.formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!stockInStore.formData.receivedBy) {
      newErrors.receivedBy = 'Received by is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const result = await stockInStore.createStockIn();
    if (result) {
      setDialogVisible(true);
    }
  };

  const updateField = (field: keyof CreateStockInPayload, value: string | number) => {
    stockInStore.updateFormData({
      [field]: value
    } as Partial<CreateStockInPayload>);

    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text variant="titleLarge" style={styles.title}>Create Stock In Record</Text>

        <TextInput
          label="Product ID *"
          value={stockInStore.formData.productId}
          onChangeText={(text) => updateField('productId', text)}
          mode="outlined"
          style={styles.input}
          error={!!errors.productId}
        />
        {errors.productId && <HelperText type="error">{errors.productId}</HelperText>}

        <TextInput
          label="Product Name *"
          value={stockInStore.formData.productName}
          onChangeText={(text) => updateField('productName', text)}
          mode="outlined"
          style={styles.input}
          error={!!errors.productName}
        />
        {errors.productName && <HelperText type="error">{errors.productName}</HelperText>}

        <View style={styles.row}>
          <View style={styles.quantityContainer}>
            <TextInput
              label="Quantity *"
              value={stockInStore.formData.quantity.toString()}
              onChangeText={(text) => {
                const num = parseFloat(text);
                updateField('quantity', isNaN(num) ? 0 : num);
              }}
              keyboardType="numeric"
              mode="outlined"
              style={styles.quantityInput}
              error={!!errors.quantity}
            />
            {errors.quantity && <HelperText type="error">{errors.quantity}</HelperText>}
          </View>

          <View style={styles.unitContainer}>
            <Menu
              visible={unitMenuVisible}
              onDismiss={() => setUnitMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setUnitMenuVisible(true)}
                  style={styles.unitButton}
                >
                  {stockInStore.formData.unit || 'Select Unit'}
                </Button>
              }
            >
              {unitOptions.map((unit) => (
                <Menu.Item
                  key={unit}
                  onPress={() => {
                    updateField('unit', unit);
                    setUnitMenuVisible(false);
                  }}
                  title={unit}
                />
              ))}
            </Menu>
          </View>
        </View>

        <TextInput
          label="Date *"
          value={stockInStore.formData.date}
          onChangeText={(text) => updateField('date', text)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Received By *"
          value={stockInStore.formData.receivedBy}
          onChangeText={(text) => updateField('receivedBy', text)}
          mode="outlined"
          style={styles.input}
          error={!!errors.receivedBy}
        />
        {errors.receivedBy && <HelperText type="error">{errors.receivedBy}</HelperText>}

        <TextInput
          label="Supplier Name"
          value={stockInStore.formData.supplierName || ''}
          onChangeText={(text) => updateField('supplierName', text)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Supplier Invoice"
          value={stockInStore.formData.supplierInvoice || ''}
          onChangeText={(text) => updateField('supplierInvoice', text)}
          mode="outlined"
          style={styles.input}
        />

        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setStatusMenuVisible(true)}
              style={styles.statusButton}
            >
              Status: {statusOptions.find(s => s.value === stockInStore.formData.status)?.label || 'Pending'}
            </Button>
          }
        >
          {statusOptions.map((status) => (
            <Menu.Item
              key={status.value}
              onPress={() => {
                updateField('status', status.value);
                setStatusMenuVisible(false);
              }}
              title={status.label}
            />
          ))}
        </Menu>

        <TextInput
          label="Notes"
          value={stockInStore.formData.notes || ''}
          onChangeText={(text) => updateField('notes', text)}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        <View style={styles.actions}>
          <Button mode="outlined" onPress={onCancel} style={styles.button}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={stockInStore.isLoading}
            disabled={stockInStore.isLoading}
            style={styles.button}
          >
            Submit
          </Button>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Success</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Stock in record created successfully.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setDialogVisible(false);
              onCancel();
            }}>OK</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quantityContainer: {
    flex: 2,
    marginRight: 8,
  },
  quantityInput: {
    flex: 1,
  },
  unitContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  unitButton: {
    height: 56,
    justifyContent: 'center',
  },
  statusButton: {
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  }
});

export default StockInForm;