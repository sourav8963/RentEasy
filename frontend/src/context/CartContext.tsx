import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  images: string[];
  rentPerMonth: number;
  securityDeposit: number;
  rentalPlan: number; // Duration in months, e.g. 3, 6, 12, 24
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (productId: string, rentalPlan: number) => void;
  updateQuantity: (productId: string, rentalPlan: number, quantity: number) => void;
  updatePlan: (productId: string, oldPlan: number, newPlan: number) => void;
  clearCart: () => void;
  totalMonthlyRent: number;
  totalSecurityDeposit: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('rentease_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('rentease_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.productId === item.productId && i.rentalPlan === item.rentalPlan
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += item.quantity || 1;
        return next;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (productId: string, rentalPlan: number) => {
    setCart((prev) => prev.filter((i) => !(i.productId === productId && i.rentalPlan === rentalPlan)));
  };

  const updateQuantity = (productId: string, rentalPlan: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, rentalPlan);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.productId === productId && i.rentalPlan === rentalPlan ? { ...i, quantity } : i))
    );
  };

  const updatePlan = (productId: string, oldPlan: number, newPlan: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.productId === productId && i.rentalPlan === oldPlan);
      if (idx === -1) return prev;

      const updated = [...prev];
      const target = updated[idx];

      // Check if we already have this product with the new plan
      const existingNewPlanIdx = updated.findIndex(
        (i) => i.productId === productId && i.rentalPlan === newPlan
      );

      if (existingNewPlanIdx > -1 && existingNewPlanIdx !== idx) {
        // Merge them
        updated[existingNewPlanIdx].quantity += target.quantity;
        updated.splice(idx, 1);
      } else {
        target.rentalPlan = newPlan;
        // Apply tenure discounts:
        // 3m: base, 6m: 5% off, 12m: 10% off, 24m: 15% off
        // Note: we can either preserve base price or do visual discount. Let's keep it simple: the original price is the base.
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalMonthlyRent = cart.reduce((acc, item) => acc + item.rentPerMonth * item.quantity, 0);
  const totalSecurityDeposit = cart.reduce((acc, item) => acc + item.securityDeposit * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updatePlan,
        clearCart,
        totalMonthlyRent,
        totalSecurityDeposit
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
