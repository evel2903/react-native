/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native'
import * as Linking from 'expo-linking'
import { RootStackParamList } from './Types/Index'

const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [Linking.createURL('/')],
    config: {
        screens: {
            Auth: 'auth',
            Home: 'home',
            Posts: 'posts',
            Post: 'post/:id',
            Inventory: 'inventory',
            InventoryProcess: 'inventory/:id/process',
            StockIn: 'stock-in',
            StockInProcess: 'stock-in/:id/process',
            StockOut: 'stock-out',
            StockOutProcess: 'stock-out/:id/process',
            NotFound: '*',
        },
    },
}

export default linking
