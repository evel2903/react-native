// src/Common/Domain/Entities/UnitEntity.ts
export interface UnitEntity {
    id: string;
    name: string;
    description?: string | null;
    isActive: boolean;
    isDeleted: boolean;
}