import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>{children}</NextThemesProvider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = useNextTheme
