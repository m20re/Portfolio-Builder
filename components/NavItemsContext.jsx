"use client";

import { createContext, useContext, useState } from "react";

const NavItemsContext = createContext(null);

export function NavItemsProvider({ children }) {
  const [navItems, setNavItems] = useState([
    { label: "Home", slug: "home" },
  ]);
  const [count, setCount] = useState(1); // for Item 1, Item 2...

  const addItem = () => {
    const label = `Item ${count}`;
    const slug = `item-${count}`;
    const updated = [...navItems, { label, slug }];
    setNavItems(updated);
    setCount((prev) => prev + 1);
    console.log("After addItem, navItems:", updated);
  };

  const updateLabel = (slug, newLabel) => {
    const updated = navItems.map((item) =>
      item.slug === slug ? { ...item, label: newLabel } : item
    );
    setNavItems(updated);
    console.log("After updateLabel, navItems:", updated);
  };

  return (
    <NavItemsContext.Provider
      value={{ navItems, addItem, updateLabel }}
    >
      {children}
    </NavItemsContext.Provider>
  );
}

export function useNavItems() {
  const ctx = useContext(NavItemsContext);
  if (!ctx) {
    throw new Error("useNavItems must be used inside NavItemsProvider");
  }
  return ctx;
}
