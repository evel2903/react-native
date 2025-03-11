import { PropsWithChildren } from "react";
import { GetInventoryStore } from "./GetInventoryStore";
import { GetInventoryStoreContext } from "./GetInventoryStoreContext";
import { inventoryModuleContainer } from "@/src/Inventory/InventoryModule";

export const GetInventoryStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <GetInventoryStoreContext.Provider
      value={inventoryModuleContainer.get(GetInventoryStore)}
    >
      {children}
    </GetInventoryStoreContext.Provider>
  );
};