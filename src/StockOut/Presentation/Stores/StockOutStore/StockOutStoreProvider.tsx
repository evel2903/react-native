import { PropsWithChildren } from "react";
import { StockOutStoreContext } from "./StockOutStoreContext";
import { StockOutStore } from "./StockOutStore";
import { stockOutModuleContainer } from "@/src/StockOut/StockOutModule";

export const StockOutStoreProvider = ({ children }: PropsWithChildren) => {
    return (
        <StockOutStoreContext.Provider
            value={stockOutModuleContainer.get(StockOutStore)}
        >
            {children}
        </StockOutStoreContext.Provider>
    );
};