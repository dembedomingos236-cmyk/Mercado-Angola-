import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface SellerCartGroup {
  sellerId: string;
  storeName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  sellerGroups: SellerCartGroup[];
  subtotal: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  deliveryFeeTotal: number;
  driverFeeTotal: number;
  platformDeliveryFeeTotal: number;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  deliveryType: 'domicilio' | 'ponto_encontro';
  setDeliveryType: (type: 'domicilio' | 'ponto_encontro') => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mercado_angola_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'domicilio' | 'ponto_encontro'>('domicilio');

  useEffect(() => {
    try {
      localStorage.setItem('mercado_angola_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Falha ao persistir carrinho no armazenamento local:', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1): boolean => {
    if (product.stock <= 0) return false;

    setItems((prev) => {
      const existing = prev.find((i) => i.product.productId === product.productId);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((i) =>
          i.product.productId === product.productId ? { ...i, quantity: newQty } : i
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: Math.min(product.stock, quantity),
          sellerId: product.sellerId,
        },
      ];
    });
    return true;
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.product.productId === productId) {
          const validQty = Math.min(i.product.stock, quantity);
          return { ...i, quantity: validQty };
        }
        return i;
      })
    );
  };

  const clearCart = () => setItems([]);

  // Calculate grouped seller structures
  const sellerMap = new Map<string, CartItem[]>();
  for (const item of items) {
    const list = sellerMap.get(item.sellerId) || [];
    list.push(item);
    sellerMap.set(item.sellerId, list);
  }

  const sellerGroups: SellerCartGroup[] = [];
  let subtotal = 0;
  let deliveryFeeTotal = 0;

  for (const [sellerId, groupItems] of sellerMap.entries()) {
    const groupSubtotal = groupItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    subtotal += groupSubtotal;

    // Delivery cost: 3.000 Kz standard (split: 2.000 Kz driver + 1.000 Kz platform)
    const baseFee = groupItems.reduce((max, item) => Math.max(max, item.product.deliveryCost || 3000), 3000);
    const sellerFee = deliveryType === 'ponto_encontro' ? 0 : baseFee;
    deliveryFeeTotal += sellerFee;

    sellerGroups.push({
      sellerId,
      storeName: groupItems[0]?.product.storeName || 'Vendedor Angolano',
      items: groupItems,
      subtotal: groupSubtotal,
      deliveryFee: sellerFee,
    });
  }

  // Exact Rule: Product 100.000 Kz + 5% Platform Fee (5.000 Kz) + Delivery 3.000 Kz = 108.000 Kz Total
  const platformFeeRate = 0.05;
  const platformFeeAmount = Math.round(subtotal * platformFeeRate);
  const driverFeeTotal = deliveryType === 'ponto_encontro' ? 0 : 2000 * Math.max(1, sellerGroups.length);
  const platformDeliveryFeeTotal = deliveryType === 'ponto_encontro' ? 0 : Math.max(0, deliveryFeeTotal - driverFeeTotal);
  const total = subtotal + platformFeeAmount + deliveryFeeTotal;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        sellerGroups,
        subtotal,
        platformFeeRate,
        platformFeeAmount,
        deliveryFeeTotal,
        driverFeeTotal,
        platformDeliveryFeeTotal,
        total,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        deliveryType,
        setDeliveryType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
