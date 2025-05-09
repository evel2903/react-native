import { GoodsEntity } from './GoodsEntity'

export interface StockInDetailItem {
    id: string
    goodsId: string
    goodsCode?: string // Added to match API response
    goodsName?: string // Added to match API response
    quantity: number
    price: string
    expiryDate?: string
    notes?: string
    goods?: GoodsEntity | null
}
