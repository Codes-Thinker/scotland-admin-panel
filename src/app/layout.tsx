import type { Metadata } from "next";
import { AdminStoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fife Nearby Taxis — Admin",
  description: "Operations dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminStoreProvider>{children}</AdminStoreProvider>
      </body>
    </html>
  );
}
