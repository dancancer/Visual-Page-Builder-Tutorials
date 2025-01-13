import type { Viewport } from "next";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export default function Layout({ children }: LayoutProps) {
  return <>{children}</>;
}
