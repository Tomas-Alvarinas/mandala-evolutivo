import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${sourceSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <Header />
        {children}
      </body>
    </html>
  );
}
