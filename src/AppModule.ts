// src/AppModule.ts
import { module } from 'inversiland'
import { CoreModule } from './Core/CoreModule'
import { AuthModule } from './Auth/AuthModule'
import { StockInModule } from './StockIn/StockInModule'
import { CommonModule } from './Common/CommonModule'

@module({
    imports: [CoreModule, CommonModule, AuthModule, StockInModule],
})
export default class AppModule {}
