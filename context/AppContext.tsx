
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, CartItem, Product, Category, Order, OrderStatus } from '../types';
import { api } from '../services/api';

interface AppContextType {
  user: User | null;
  login: (role: 'customer' | 'admin') => Promise<void>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  products: Product[];
  categories: Category[];
  orders: Order[];
  users: User[];
  loading: boolean;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productData: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  notification: string | null;
  setNotification: React.Dispatch<React.SetStateAction<string | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData, ordersData, usersData] = await Promise.all([
          api.fetchProducts(),
          api.fetchCategories(),
          api.fetchOrders(),
          api.fetchUsers(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setOrders(ordersData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        setNotification('Failed to load data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const login = async (role: 'customer' | 'admin') => {
    const userData = await api.login(role);
    setUser(userData);
  };

  const logout = () => setUser(null);

  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    setNotification(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    setNotification(`Item removed from cart.`);
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => setCart([]);
  
  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct = await api.createProduct(productData);
    setProducts(prev => [...prev, newProduct]);
    setNotification('Product added successfully!');
  };

  const updateProduct = async (productData: Product) => {
    const updatedProduct = await api.updateProduct(productData);
    setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
    setNotification('Product updated successfully!');
  };

  const deleteProduct = async (productId: number) => {
    await api.deleteProduct(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    setNotification('Product deleted successfully!');
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const updatedOrder = await api.updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setNotification(`Order ${orderId} status updated!`);
  };

  const value = {
    user, login, logout,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal,
    products, categories, orders, users, loading,
    addProduct, updateProduct, deleteProduct, updateOrderStatus,
    notification, setNotification
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
