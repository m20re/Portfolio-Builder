"use client";
import dynamic from "next/dynamic";
import { NavItemsProvider } from '../../components/NavItemsContext';
const PortfolioNavbar = dynamic(
  () => import("../../components/PortfolioNavbar"),
  { ssr: false } // 🔴 disable SSR for this component
);
export default function BuilderLayout({ children }) {
  return (
    <NavItemsProvider>
      <PortfolioNavbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </div>
    </NavItemsProvider>
  );
}
