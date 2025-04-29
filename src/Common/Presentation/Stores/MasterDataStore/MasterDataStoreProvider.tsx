// src/Common/Presentation/Stores/MasterDataStore/MasterDataStoreProvider.tsx
import { PropsWithChildren } from 'react';
import { MasterDataStoreContext } from './MasterDataStoreContext';
import { MasterDataStore } from './MasterDataStore';
import { commonModuleContainer } from '@/src/Common/CommonModule';

export const MasterDataStoreProvider = ({ children }: PropsWithChildren) => {
    return (
        <MasterDataStoreContext.Provider value={commonModuleContainer.get(MasterDataStore)}>
            {children}
        </MasterDataStoreContext.Provider>
    );
};