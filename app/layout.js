import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from '@clerk/nextjs';

const outfit = Outfit({ subsets: ['latin'], weight: ["300", "400", "500"] })

export const metadata = {
  title: "Hanzala.co - Premium E-Commerce",
  description: "India's Premier E-Commerce Platform for Electronics by Hanzala Khan",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 transition-colors duration-300`} >
          <ThemeProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-white',
                style: {
                  background: 'var(--toast-bg, #fff)',
                  color: 'var(--toast-color, #000)',
                },
              }}
            />
            <AppContextProvider>
              {children}
            </AppContextProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
