import { useState, useEffect } from "react";
import type { Product } from "@/hooks/use-products";

export interface CartItem {
  product: Product;
  quantity: number;
}

const CART_KEY = "cart";

const loadCart = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
};

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.productId === product.productId);
      if (existing) {
        return prev.map((i) =>
          i.product.productId === product.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.productId === productId ? { ...i, quantity } : i,
      ),
    );
  };

  const clearCart = () => setItems([]);

  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.unitPrice * i.quantity,
    0,
  );

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems };
};
