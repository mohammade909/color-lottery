import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navigation from "../components/Navigation";
// import { GameProvider } from "../context/gameContext";
// import SocketInitializer from "./socketInitilizer";
import { Toaster } from 'react-hot-toast';
const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Real-Time App",
//   description: "Real-time application with NextJS and NestJS",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <GameProvider> */}
           {/* <SocketInitializer /> */}
          <Navigation />
          <main >{children}</main>
          <Toaster position="top-right" />
        {/* </GameProvider> */}
      </body>
    </html>
  );
}
