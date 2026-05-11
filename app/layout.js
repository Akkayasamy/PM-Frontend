import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { DataProvider } from "@/context/data-context";
import { ApiProvider } from "@/context/api-context";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Project Management System",
  description: "A comprehensive project management system with RBAC",
};

export default function RootLayout({ children }) {
  return (
    /* 
       The 'suppressHydrationWarning' attribute is necessary because 
       ThemeProvider modifies the html attributes on the client side.
    */
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            <ApiProvider>
              <AuthProvider>
                <DataProvider>{children}</DataProvider>
              </AuthProvider>
            </ApiProvider>
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}