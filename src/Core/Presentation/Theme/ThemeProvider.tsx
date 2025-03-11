import React, { PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { useColorScheme } from 'react-native';

// Define our theme with custom colors
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
    error: '#b00020',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    secondary: '#03dac6',
    error: '#cf6679',
  },
};

// Theme context to allow components to access and toggle theme
interface ThemeContextValue {
  theme: typeof lightTheme;
  isDarkTheme: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const colorScheme = useColorScheme();
  const [isDarkTheme, setIsDarkTheme] = useState(colorScheme === 'dark');

  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prev) => !prev);
  }, []);

  const theme = useMemo(() => {
    return isDarkTheme ? darkTheme : lightTheme;
  }, [isDarkTheme]);

  const contextValue = useMemo(
    () => ({
      theme,
      isDarkTheme,
      toggleTheme,
    }),
    [theme, isDarkTheme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};