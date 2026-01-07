"use client";

import { useState, useCallback } from "react";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileMegaMenu } from "./MobileMegaMenu";
import { useSearch } from "./SearchBar";
import type { MegaMenuCategory } from "@/types/storefront";

interface MobileNavWrapperProps {
  categories: MegaMenuCategory[];
}

export function MobileNavWrapper({ categories }: MobileNavWrapperProps) {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const { openSearch } = useSearch();

  const handleCategoriesClick = useCallback(() => {
    setIsMegaMenuOpen(true);
  }, []);

  const handleMegaMenuClose = useCallback(() => {
    setIsMegaMenuOpen(false);
  }, []);

  const handleSearchClick = useCallback(() => {
    openSearch();
  }, [openSearch]);

  return (
    <>
      <MobileBottomNav
        onCategoriesClick={handleCategoriesClick}
        onSearchClick={handleSearchClick}
      />
      <MobileMegaMenu
        categories={categories}
        isOpen={isMegaMenuOpen}
        onClose={handleMegaMenuClose}
      />
    </>
  );
}
