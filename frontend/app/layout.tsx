import RoleBasedLayout from "@/components/Layout/RoleBasedLayout";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// import { GameProvider } from "../context/gameContext";
// import SocketInitializer from "./socketInitilizer";
import { Toaster } from "react-hot-toast";
import PrivateRoutes from "@/components/Layout/PrivateRoutes";
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
        {/* <Navigation /> */}
        <PrivateRoutes>
          <main>{children}</main>
        </PrivateRoutes>
        <Toaster position="top-right" />
        {/* </GameProvider> */}
      </body>
    </html>
  );
}
