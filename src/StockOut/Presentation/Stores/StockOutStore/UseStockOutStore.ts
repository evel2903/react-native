import { useContextStore } from 'src/Core/Presentation/Hooks/UseContextStore'
import { StockOutStore } from './StockOutStore'
import { StockOutStoreContext } from './StockOutStoreContext'

export const useStockOutStore = (): StockOutStore => {
    const store = useContextStore(StockOutStoreContext)

    return store
}
