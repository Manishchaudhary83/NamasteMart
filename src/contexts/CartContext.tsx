import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalVAT: number;
  grandTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: any) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product._id);
      if (existing) {
        return prev.map(i => i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        productId: product._id,
        productName: product.productName,
        barcode: product.barcode,
        quantity: 1,
        unitPrice: product.sellingPrice,
        taxRate: product.taxRate || 13
      }];
    });
  };

  const removeItem = (productId: string) => setItems(prev => prev.filter(i => i.productId !== productId));

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(productId);
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const totalVAT = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity * (item.taxRate / 100)), 0);
  const grandTotal = subtotal + totalVAT;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalVAT, grandTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
