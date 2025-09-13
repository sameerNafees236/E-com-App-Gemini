
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ProductCard, Spinner, TrashIcon } from '../components/ui';
import type { Product, Category } from '../types';

// Home Page Component
const HomePage: React.FC = () => {
  const { products, categories, loading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(p => selectedCategory === null || p.categoryId === selectedCategory);
  }, [products, searchTerm, selectedCategory]);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="bg-primary-600 rounded-lg p-8 mb-8 text-white text-center">
        <h1 className="text-4xl font-bold mb-2">Welcome to Gemini E-Commerce</h1>
        <p className="text-lg">Discover products of the future, today.</p>
      </div>
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
        />
        <select
          value={selectedCategory ?? ''}
          onChange={e => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
          className="w-full sm:w-1/2 p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

// Product Detail Page Component
const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, loading } = useAppContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === Number(id));
    setProduct(foundProduct || null);
  }, [id, products]);

  if (loading) return <Spinner />;
  if (!product) return <div className="text-center text-2xl">Product not found.</div>;

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={product.imageUrl} alt={product.name} className="w-full rounded-lg object-cover aspect-square" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="text-3xl font-bold text-primary-600 mb-4">${product.price.toFixed(2)}</p>
          {product.stock > 0 ? (
            <div className="flex items-center space-x-4">
              <input 
                type="number" 
                value={quantity} 
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max={product.stock}
                className="w-20 p-2 border rounded-md"
              />
              <button onClick={handleAddToCart} className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition">
                Add to Cart
              </button>
            </div>
          ) : (
            <p className="text-red-500 font-bold">Out of Stock</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Cart Page Component
const CartPage: React.FC = () => {
  const { cart, cartTotal, updateCartQuantity, removeFromCart, clearCart } = useAppContext();
  const navigate = useNavigate();

  const handleCheckout = () => {
    alert('Checkout is not implemented. Thank you for your order!');
    clearCart();
    navigate('/');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center">
                  <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 rounded-md object-cover mr-4" />
                  <div>
                    <h2 className="font-semibold">{item.product.name}</h2>
                    <p className="text-gray-600">${item.product.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateCartQuantity(item.product.id, parseInt(e.target.value))}
                    min="1"
                    className="w-16 p-1 border rounded-md"
                  />
                  <p className="font-semibold w-24 text-right">${(item.product.price * item.quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <h2 className="text-2xl font-bold">Total: ${cartTotal.toFixed(2)}</h2>
            <button onClick={handleCheckout} className="mt-4 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Order History Page Component
const OrderHistoryPage: React.FC = () => {
    const { orders, user, loading } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (loading) return <Spinner />;
    
    const userOrders = orders.filter(o => o.userId === user?.id);

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
            {userOrders.length === 0 ? (
                <p>You have no past orders.</p>
            ) : (
                <div className="space-y-6">
                    {userOrders.map(order => (
                        <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-bold">Order ID: {order.id}</h2>
                                <span className={`px-2 py-1 text-sm rounded-full ${order.status === 'Delivered' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{order.status}</span>
                            </div>
                            <p className="text-sm text-gray-600">Date: {order.createdAt.toLocaleDateString()}</p>
                            <p className="font-semibold text-lg">Total: ${order.total.toFixed(2)}</p>
                            <div className="mt-2 border-t pt-2">
                                {order.items.map(item => (
                                    <div key={item.product.id} className="flex justify-between text-sm">
                                        <span>{item.product.name} x {item.quantity}</span>
                                        <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// Main Storefront Router Component
export const Storefront: React.FC = () => {
  return (
    <Routes>
      <Route index element={<HomePage />} />
      <Route path="product/:id" element={<ProductDetailPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="orders" element={<OrderHistoryPage />} />
    </Routes>
  );
};
