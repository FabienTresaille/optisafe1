import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter', display: 'swap' });
const poppins = Poppins({ 
  weight: ['600', '700'],
  subsets: ["latin"],
  variable: '--font-poppins',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Optisafe.fr | Vos contrats d'assurance, enfin clairs.",
  description: "Comparez vos contrats, détectez les doublons et générez votre fiche d'urgence en quelques clics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${poppins.variable}`}>
        {children}
      </body>
    </html>
  );
}
