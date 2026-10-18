import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/AuthContext";
import { DataProvider } from "@/features/core/DataContext";

export const metadata: Metadata = {
  title: "EIS Institute - Sistema Integral de Gestión Académica y Administrativa",
  description:
    "Plataforma oficial de gestión para la Cultural Inglesa de Ensenada (EIS Institute). Convenios oficiales Anglia Examinations y Universidad Tecnológica Nacional (UTN).",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#F8F9FA] text-slate-900 antialiased selection:bg-[#00205B] selection:text-white">
        <AuthProvider>
          <DataProvider>{children}</DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
