// src/Tracking/Presentation/Stores/TrackingStore/TrackingStoreContext.ts
import { createContext } from 'react';
import { TrackingStore } from './TrackingStore';

export const TrackingStoreContext = createContext<TrackingStore | null>(null);

TrackingStoreContext.displayName = 'TrackingStoreContext';