import { GoodsEntity } from "./GoodsEntity";

export interface StockInDetailItem {
    id: string;
    goodsId: string;
    quantity: number;
    price: string;
    expiryDate?: string;
    notes?: string;
    goods?: GoodsEntity | null;
}