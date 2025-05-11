// src/Core/Presentation/Navigation/Types/Index.tsx
import {
    NativeStackNavigationProp,
    NativeStackScreenProps,
} from '@react-navigation/native-stack'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace ReactNavigation {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface RootParamList extends RootStackParamList {}
    }
}

export type RootStackParamList = {
    Auth: undefined
    Home: undefined
    StockIn: undefined
    StockInAdd: undefined
    StockInView: { id: string }
    StockInEdit: { id: string }
    Storage: undefined
    StorageView: { id: string }
    NotFound: undefined
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, Screen>

export type RootScreenNavigationProp<Screen extends keyof RootStackParamList> =
    NativeStackNavigationProp<RootStackParamList, Screen>
