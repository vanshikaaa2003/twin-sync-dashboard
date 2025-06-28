// src/components/ThemeProvider.jsx
import { ThemeProvider as NextThemesProvider } from "next-themes";

export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"          /* toggles dark class on <html> */
      defaultTheme="light"
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
