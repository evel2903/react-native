import { module } from 'inversiland'
import { PostModule } from './post/PostModule'
import { CoreModule } from './Core/CoreModule'
import { AuthModule } from './Auth/AuthModule'
import { InventoryModule } from './Inventory/InventoryModule'
import { StockInModule } from './StockIn/StockInModule'
import { StockOutModule } from './StockOut/StockOutModule'

@module({
    imports: [
        CoreModule,
        PostModule,
        AuthModule,
        InventoryModule,
        StockInModule,
        StockOutModule,
    ],
})
export default class AppModule {}
