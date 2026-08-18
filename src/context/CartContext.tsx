import { createContext, useContext, useEffect, useState } from "react";
import type { Producto } from "../data/catalogo";

// Carrito de la maqueta: vive en localStorage, sin backend.
// Cuando exista el Supabase del proyecto se sincroniza con `cart_sessions`
// usando el mismo `sessionToken` que va a usar el widget del bot (ver docs/bot.md).

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

interface CartValue {
  items: CartItem[];
  sessionToken: string;
  agregar: (p: Producto, cantidad?: number) => void;
  quitar: (id: string) => void;
  cambiarCantidad: (id: string, cantidad: number) => void;
  vaciar: () => void;
  totalItems: number;
  total: number;
}

const Ctx = createContext<CartValue | undefined>(undefined);

const STORAGE_ITEMS = "cls_cart_items";
const STORAGE_TOKEN = "cls_session_token";

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart debe usarse dentro de CartProvider");
  return c;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [sessionToken, setSessionToken] = useState("");

  useEffect(() => {
    let token = localStorage.getItem(STORAGE_TOKEN);
    if (!token) {
      token = `cls-${Math.random().toString(36).slice(2, 11)}-${Date.now()}`;
      localStorage.setItem(STORAGE_TOKEN, token);
    }
    setSessionToken(token);

    const guardado = localStorage.getItem(STORAGE_ITEMS);
    if (guardado) {
      try {
        setItems(JSON.parse(guardado));
      } catch {
        localStorage.removeItem(STORAGE_ITEMS);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_ITEMS, JSON.stringify(items));
  }, [items]);

  function agregar(producto: Producto, cantidad = 1) {
    setItems((prev) => {
      const existe = prev.find((i) => i.producto.id === producto.id);
      if (existe) {
        return prev.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
        );
      }
      return [...prev, { producto, cantidad }];
    });
  }

  function quitar(id: string) {
    setItems((prev) => prev.filter((i) => i.producto.id !== id));
  }

  function cambiarCantidad(id: string, cantidad: number) {
    if (cantidad <= 0) return quitar(id);
    setItems((prev) => prev.map((i) => (i.producto.id === id ? { ...i, cantidad } : i)));
  }

  function vaciar() {
    setItems([]);
  }

  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);
  const total = items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0);

  return (
    <Ctx.Provider value={{ items, sessionToken, agregar, quitar, cambiarCantidad, vaciar, totalItems, total }}>
      {children}
    </Ctx.Provider>
  );
}
