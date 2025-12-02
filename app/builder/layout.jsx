"use client";

import { NavItemsProvider } from '../../components/NavItemsContext';
import PortfolioNavbar from '../../components/PortfolioNavbar';

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
