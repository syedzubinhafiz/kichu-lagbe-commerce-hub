
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Cart, CartItem, Product } from '@/types';
import { toast } from 'sonner';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const initialCart: Cart = {
  items: [],
  totalItems: 0,
  totalAmount: 0
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<Cart>(initialCart);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('kichu_lagbe_cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('kichu_lagbe_cart', JSON.stringify(cart));
  }, [cart]);

  // Calculate totals whenever cart items change
  const calculateTotals = (items: CartItem[]): Cart => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity,
      0
    );
    return { items, totalItems, totalAmount };
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart(currentCart => {
      const existingItemIndex = currentCart.items.findIndex(
        item => item.productId === product.id
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        newItems = [...currentCart.items];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem: CartItem = {
          productId: product.id,
          product,
          quantity
        };
        newItems = [...currentCart.items, newItem];
      }

      toast.success(`${product.title} added to cart`);
      return calculateTotals(newItems);
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(currentCart => {
      const newItems = currentCart.items.filter(item => item.productId !== productId);
      toast.info('Item removed from cart');
      return calculateTotals(newItems);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(currentCart => {
      const newItems = currentCart.items.map(item => {
        if (item.productId === productId) {
          return { ...item, quantity };
        }
        return item;
      });

      return calculateTotals(newItems);
    });
  };

  const clearCart = () => {
    setCart(initialCart);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
