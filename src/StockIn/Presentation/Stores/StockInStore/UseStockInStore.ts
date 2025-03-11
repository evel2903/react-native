import { useContextStore } from 'src/Core/Presentation/Hooks/UseContextStore'
import { StockInStore } from './StockInStore'
import { StockInStoreContext } from './StockInStoreContext'

export const useStockInStore = (): StockInStore => {
    const store = useContextStore(StockInStoreContext)

    return store
}
