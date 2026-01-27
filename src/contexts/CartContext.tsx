import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from './ProductContext';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (product: Product, size: string, color: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string, size: string, color: string) => Promise<void>;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'fashion_store_cart';

// Transform database row to CartItem
const transformCartItem = (row: any): CartItem => ({
  product: {
    id: row.products.id,
    name: row.products.name,
    description: row.products.description || '',
    price: Number(row.products.price),
    category: row.products.category,
    sizes: row.products.sizes || [],
    colors: row.products.colors || [],
    images: row.products.images || [],
    inStock: row.products.in_stock,
    createdAt: row.products.created_at,
  },
  quantity: row.quantity,
  size: row.size,
  color: row.color,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from localStorage for guests, from Supabase for logged-in users
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            quantity,
            size,
            color,
            products (
              id,
              name,
              description,
              price,
              category,
              sizes,
              colors,
              images,
              in_stock,
              created_at
            )
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching cart:', error);
        } else {
          setItems((data || []).map(transformCartItem));
        }
        setIsLoading(false);
      } else {
        // Guest user - use localStorage
        const stored = localStorage.getItem(CART_KEY);
        if (stored) {
          setItems(JSON.parse(stored));
        } else {
          setItems([]);
        }
      }
    };

    loadCart();
  }, [user]);

  // Save to localStorage for guests
  const saveToLocalStorage = (newItems: CartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(newItems));
    setItems(newItems);
  };

  const addToCart = async (product: Product, size: string, color: string, quantity = 1) => {
    if (user) {
      // Check if item exists
      const existingItem = items.find(
        item => item.product.id === product.id && item.size === size && item.color === color
      );

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .eq('size', size)
          .eq('color', color);

        if (error) {
          console.error('Error updating cart:', error);
          return;
        }
      } else {
        // Insert new item
        const { error } = await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: product.id,
          quantity,
          size,
          color,
        });

        if (error) {
          console.error('Error adding to cart:', error);
          return;
        }
      }

      // Refetch cart
      const { data } = await supabase
        .from('cart_items')
        .select(`
          quantity,
          size,
          color,
          products (
            id,
            name,
            description,
            price,
            category,
            sizes,
            colors,
            images,
            in_stock,
            created_at
          )
        `)
        .eq('user_id', user.id);

      setItems((data || []).map(transformCartItem));
    } else {
      // Guest user - localStorage
      const existingIndex = items.findIndex(
        item => item.product.id === product.id && item.size === size && item.color === color
      );

      if (existingIndex >= 0) {
        const updated = [...items];
        updated[existingIndex].quantity += quantity;
        saveToLocalStorage(updated);
      } else {
        saveToLocalStorage([...items, { product, quantity, size, color }]);
      }
    }
  };

  const removeFromCart = async (productId: string, size: string, color: string) => {
    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size)
        .eq('color', color);

      if (error) {
        console.error('Error removing from cart:', error);
        return;
      }

      setItems(items.filter(
        item => !(item.product.id === productId && item.size === size && item.color === color)
      ));
    } else {
      saveToLocalStorage(items.filter(
        item => !(item.product.id === productId && item.size === size && item.color === color)
      ));
    }
  };

  const updateQuantity = async (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId, size, color);
      return;
    }

    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('size', size)
        .eq('color', color);

      if (error) {
        console.error('Error updating quantity:', error);
        return;
      }

      setItems(items.map(item =>
        item.product.id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      ));
    } else {
      const updated = items.map(item =>
        item.product.id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      );
      saveToLocalStorage(updated);
    }
  };

  const clearCart = async () => {
    if (user) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error clearing cart:', error);
        return;
      }
    } else {
      localStorage.removeItem(CART_KEY);
    }
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items,
      isLoading,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
