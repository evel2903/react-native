// src/Tracking/TrackingModule.ts
import { getModuleContainer, module } from 'inversiland';

@module({
    providers: [],
})
export class TrackingModule {}

export const trackingModuleContainer = getModuleContainer(TrackingModule);