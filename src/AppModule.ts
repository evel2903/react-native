import { StorageModule } from './Storage/StorageModule'
// src/AppModule.ts
import { module } from 'inversiland'
import { CoreModule } from './Core/CoreModule'
import { AuthModule } from './Auth/AuthModule'
import { StockInModule } from './StockIn/StockInModule'
import { CommonModule } from './Common/CommonModule'
import { StockOutModule } from './StockOut/StockOutModule'
import { PickingModule } from './Picking/PickingModule'

@module({
    imports: [
        CoreModule,
        CommonModule,
        AuthModule,
        StockInModule,
        StorageModule,
        PickingModule,
        StockOutModule,
    ],
})
export default class AppModule {}
