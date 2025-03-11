import { NavigationContainer } from "@react-navigation/native";
import * as React from "react";
import { observer } from 'mobx-react';
import { useAuthStore } from "@/src/Auth/Presentation/Stores/AuthStore/UseAuthStore";
import { AuthStoreProvider } from "@/src/Auth/Presentation/Stores/AuthStore/AuthStoreProvider";
import { withProviders } from "../Utils/WithProviders";

import LinkingConfiguration from "./LinkingConfiguration";
import RootNavigator from "./RootNavigator";

const Navigation = observer(() => {
  const authStore = useAuthStore();
  
  return (
    <NavigationContainer 
      linking={LinkingConfiguration}
      // This determines initial route when app loads
      initialState={{
        routes: [{ name: authStore.isAuthenticated ? 'Home' : 'Auth' }]
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
});

export default withProviders(AuthStoreProvider)(Navigation);