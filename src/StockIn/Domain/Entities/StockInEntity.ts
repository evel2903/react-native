import { StockInDetailItem } from './StockInDetailItem'
import { SupplierEntity } from './SupplierEntity';
export default interface StockInEntity {
    id: string;
    code: string;
    supplierId: string;
    inDate: string;
    description?: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
    notes?: string;
    lotNumber?: string;
    totalAmount: string;
    createdBy?: string | null;
    approvedBy?: string | null;
    details: StockInDetailItem[];
    supplier?: SupplierEntity;
}
