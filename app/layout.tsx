import type { Metadata } from "next";
import {
  Inter,
  Montserrat,
  Hind_Guntur,
  Koulen,
  IBM_Plex_Sans_Hebrew,
  Konkhmer_Sleokchher
} from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const hindGuntur = Hind_Guntur({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-hind-guntur",
});

const koulen = Koulen({
  weight: "400",
  subsets: ["khmer"],
  variable: "--font-koulen",
});

const ibmPlexSansHebrew = IBM_Plex_Sans_Hebrew({
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  subsets: ["hebrew", "latin"],
  variable: "--font-ibm-plex-sans-hebrew",
});

const konkhmer = Konkhmer_Sleokchher({
  weight: "400",
  subsets: ["khmer"],
  variable: "--font-konkhmer",
});

export const metadata: Metadata = {
  title: "RePurpose",
  description: "CSS Group 10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${inter.variable} 
          ${montserrat.variable} 
          ${hindGuntur.variable} 
          ${koulen.variable} 
          ${ibmPlexSansHebrew.variable} 
          ${konkhmer.variable} 
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}
