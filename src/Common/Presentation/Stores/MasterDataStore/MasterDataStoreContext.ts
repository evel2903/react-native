// src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreContext.ts
import { createContext } from 'react';
import { MasterDataStore } from './MasterDataStore';

export const MasterDataStoreContext = createContext<MasterDataStore | null>(null);

MasterDataStoreContext.displayName = 'MasterDataStoreContext';