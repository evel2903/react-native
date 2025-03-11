import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, IconButton } from 'react-native-paper';
import InventoryItemEntity from '../../Domain/Entities/InventoryItemEntity';

interface InventoryItemProps {
  item: InventoryItemEntity;
  onPress?: (id: string) => void;
}

const InventoryItem = ({ item, onPress }: InventoryItemProps) => {
  const { 
    id, 
    name, 
    sku, 
    category, 
    quantity, 
    unit, 
    reorderLevel,
    lastUpdated 
  } = item;

  // Function to determine stock status
  const getStockStatus = (): { label: string; color: string } => {
    if (quantity <= 0) {
      return { label: 'Out of Stock', color: '#f44336' }; // Red
    } else if (quantity <= reorderLevel) {
      return { label: 'Low Stock', color: '#ff9800' }; // Orange/Amber
    } else {
      return { label: 'In Stock', color: '#4caf50' }; // Green
    }
  };

  const stockStatus = getStockStatus();
  
  // Format the date
  const formattedDate = new Date(lastUpdated).toLocaleDateString();

  const handlePress = () => {
    if (onPress) {
      onPress(id);
    }
  };

  return (
    <Card style={styles.card} onPress={handlePress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium">{name}</Text>
            <Text variant="bodySmall" style={styles.sku}>SKU: {sku}</Text>
          </View>
          <Chip 
            mode="flat" 
            style={{ backgroundColor: stockStatus.color + '20' }}
            textStyle={{ color: stockStatus.color }}
          >
            {stockStatus.label}
          </Chip>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text variant="bodySmall" style={styles.label}>Category</Text>
            <Text variant="bodyMedium">{category}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text variant="bodySmall" style={styles.label}>Quantity</Text>
            <Text variant="bodyMedium">{quantity} {unit}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text variant="bodySmall" style={styles.label}>Reorder Level</Text>
            <Text variant="bodyMedium">{reorderLevel} {unit}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text variant="bodySmall" style={styles.label}>Last Updated</Text>
            <Text variant="bodyMedium">{formattedDate}</Text>
          </View>
        </View>
      </Card.Content>
      
      <Card.Actions>
        <IconButton icon="pencil" onPress={handlePress} />
        <IconButton icon="arrow-down-bold-box" />
        <IconButton icon="arrow-up-bold-box" />
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  sku: {
    marginTop: 2,
    opacity: 0.7,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  detailItem: {
    width: '50%',
    marginBottom: 8,
  },
  label: {
    opacity: 0.7,
  }
});

export default InventoryItem;