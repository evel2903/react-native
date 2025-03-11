import { PropsWithChildren } from "react";
import { AuthStoreContext } from "./AuthStoreContext";
import { AuthStore } from "./AuthStore";
import { authModuleContainer } from "@/src/Auth/AuthModule";

export const AuthStoreProvider = ({ children }: PropsWithChildren) => {
  return (
    <AuthStoreContext.Provider
      value={authModuleContainer.get(AuthStore)}
    >
      {children}
    </AuthStoreContext.Provider>
  );
};