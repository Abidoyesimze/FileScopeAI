'use client'
import { ThemeProvider } from "./theme-provider";
import Navigation from "./components/Navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <Navigation />
      {children}
    </ThemeProvider>
  );
} 