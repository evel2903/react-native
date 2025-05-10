import { StorageModule } from './Storage/StorageModule';
// src/AppModule.ts
import { module } from 'inversiland'
import { CoreModule } from './Core/CoreModule'
import { AuthModule } from './Auth/AuthModule'
import { StockInModule } from './StockIn/StockInModule'
import { CommonModule } from './Common/CommonModule'

@module({
    imports: [CoreModule, CommonModule, AuthModule, StockInModule, StorageModule],
})
export default class AppModule {}
