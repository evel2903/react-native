import { module } from 'inversiland'
import { CoreModule } from './Core/CoreModule'
import { AuthModule } from './Auth/AuthModule'
import { StockInModule } from './StockIn/StockInModule'

@module({
    imports: [
        CoreModule,
        AuthModule,
        StockInModule,
    ],
})
export default class AppModule {}
