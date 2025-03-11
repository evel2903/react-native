import { PropsWithChildren } from "react";
import { StockInStoreContext } from "./StockInStoreContext";
import { StockInStore } from "./StockInStore";
import { stockInModuleContainer } from "@/src/StockIn/StockInModule";

export const StockInStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <StockInStoreContext.Provider
      value={stockInModuleContainer.get(StockInStore)}
    >
      {children}
    </StockInStoreContext.Provider>
  );
};