
import type { Product, Category, Order, User, OrderStatus } from '../types';

// MOCK DATA
const categories: Category[] = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Books' },
  { id: 3, name: 'Clothing' },
  { id: 4, name: 'Home Goods' },
];

let products: Product[] = [
  { id: 1, name: 'Quantum Laptop', description: 'A sleek and powerful laptop for all your needs.', price: 1200, stock: 15, imageUrl: 'https://picsum.photos/seed/laptop/400/400', categoryId: 1 },
  { id: 2, name: 'The Art of Code', description: 'A deep dive into the beauty of software development.', price: 45, stock: 50, imageUrl: 'https://picsum.photos/seed/book1/400/400', categoryId: 2 },
  { id: 3, name: 'Nebula T-Shirt', description: 'A comfortable 100% cotton t-shirt with a cosmic design.', price: 25, stock: 120, imageUrl: 'https://picsum.photos/seed/shirt/400/400', categoryId: 3 },
  { id: 4, name: 'Smart Coffee Mug', description: 'Keeps your coffee at the perfect temperature for hours.', price: 80, stock: 30, imageUrl: 'https://picsum.photos/seed/mug/400/400', categoryId: 1 },
  { id: 5, name: 'History of the Future', description: 'A compelling read about technological predictions.', price: 30, stock: 0, imageUrl: 'https://picsum.photos/seed/book2/400/400', categoryId: 2 },
  { id: 6, name: 'Ergonomic Chair', description: 'Support your back during long work sessions.', price: 350, stock: 10, imageUrl: 'https://picsum.photos/seed/chair/400/400', categoryId: 4 },
  { id: 7, name: 'Wireless Earbuds', description: 'High-fidelity sound in a compact package.', price: 150, stock: 75, imageUrl: 'https://picsum.photos/seed/earbuds/400/400', categoryId: 1 },
  { id: 8, name: 'Cyberpunk Jacket', description: 'Stylish and functional jacket for the modern urbanite.', price: 250, stock: 25, imageUrl: 'https://picsum.photos/seed/jacket/400/400', categoryId: 3 },
];

let orders: Order[] = [
  { id: 'ORD-001', userId: 'user-1', items: [{ product: products[0], quantity: 1 }], total: 1200, status: 'Delivered', createdAt: new Date(2023, 10, 5), customerName: 'Alice Johnson' },
  { id: 'ORD-002', userId: 'user-2', items: [{ product: products[2], quantity: 2 }, { product: products[4], quantity: 1 }], total: 80, status: 'Shipped', createdAt: new Date(2023, 10, 10), customerName: 'Bob Williams' },
  { id: 'ORD-003', userId: 'user-1', items: [{ product: products[6], quantity: 1 }], total: 150, status: 'Processing', createdAt: new Date(2023, 10, 12), customerName: 'Alice Johnson' },
];

let users: User[] = [
    { id: 'user-0', name: 'Admin User', email: 'admin@example.com', role: 'admin'},
    { id: 'user-1', name: 'Alice Johnson', email: 'alice@example.com', role: 'customer'},
    { id: 'user-2', name: 'Bob Williams', email: 'bob@example.com', role: 'customer'},
];

// MOCK API FUNCTIONS
const simulateDelay = <T,>(data: T): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500));

export const api = {
  // Products
  fetchProducts: () => simulateDelay(products),
  fetchProduct: (id: number) => simulateDelay(products.find(p => p.id === id) || null),
  createProduct: (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...productData, id: Date.now() };
    products.push(newProduct);
    return simulateDelay(newProduct);
  },
  updateProduct: (updatedProduct: Product) => {
    products = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    return simulateDelay(updatedProduct);
  },
  deleteProduct: (id: number) => {
    products = products.filter(p => p.id !== id);
    return simulateDelay(null);
  },
  // Categories
  fetchCategories: () => simulateDelay(categories),
  // Orders
  fetchOrders: () => simulateDelay(orders),
  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      return simulateDelay(order);
    }
    return Promise.reject('Order not found');
  },
  // Users
  fetchUsers: () => simulateDelay(users),
  // Auth
  login: (role: 'customer' | 'admin'): Promise<User> => {
      const user = users.find(u => u.role === role);
      if (!user) return Promise.reject("User not found");
      return simulateDelay(user);
  }
};
