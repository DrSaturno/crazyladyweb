import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface WishlistValue {
  ids: string[];
  total: number;
  contiene: (id: string) => boolean;
  alternar: (id: string) => void;
}

const STORAGE_KEY = "cls_wishlist_ids";
const WishlistContext = createContext<WishlistValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  // Lectura síncrona en el inicializador (igual que CartContext): si se leyera en un useEffect,
  // el primer render mostraría 0 favoritos y recién después "saltaría" a la lista real.
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const value = useMemo<WishlistValue>(
    () => ({
      ids,
      total: ids.length,
      contiene: (id) => ids.includes(id),
      alternar: (id) => setIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id])),
    }),
    [ids]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist debe usarse dentro de WishlistProvider");
  return context;
}
