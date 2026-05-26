import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";

const geist = Geist({ subsets: ["latin"] });

export const metadata = {
  title: "CertiLens",
  description: "Real-time SSL/TLS certificate intelligence platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-950 text-white`}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}