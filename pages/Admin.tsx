
import React, { useState, useEffect, FormEvent } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Spinner, Modal, PencilIcon, TrashIcon } from '../components/ui';
import type { Product, Order, User, Category, OrderStatus } from '../types';

// Admin Sidebar Component
const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const linkClasses = (path: string) => `block p-3 rounded-md hover:bg-primary-100 ${location.pathname.includes(path) ? 'bg-primary-200 font-bold' : ''}`;
    return (
        <nav className="w-64 bg-white p-4 rounded-lg shadow-md flex-shrink-0">
            <ul>
                <li><Link to="products" className={linkClasses('products')}>Manage Products</Link></li>
                <li><Link to="orders" className={linkClasses('orders')}>Manage Orders</Link></li>
                <li><Link to="users" className={linkClasses('users')}>Manage Users</Link></li>
                <li className="mt-4 border-t pt-4"><Link to="/" className="block p-3 rounded-md hover:bg-gray-100">Back to Store</Link></li>
            </ul>
        </nav>
    );
};

// Admin Layout Component
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex gap-8">
            <AdminSidebar />
            <div className="flex-grow">{children}</div>
        </div>
    );
};

// Product Form Component
const ProductForm: React.FC<{ product: Product | null, onClose: () => void, categories: Category[] }> = ({ product, onClose, categories }) => {
    const { addProduct, updateProduct } = useAppContext();
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        stock: product?.stock || 0,
        imageUrl: product?.imageUrl || 'https://picsum.photos/400/400',
        categoryId: product?.categoryId || categories[0]?.id || 1,
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const productData = { ...formData, price: Number(formData.price), stock: Number(formData.stock) };
        if (product) {
            await updateProduct({ ...product, ...productData });
        } else {
            await addProduct(productData);
        }
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label>Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required/></div>
            <div><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
            <div><label>Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
            <div><label>Stock</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
            <div><label>Image URL</label><input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
            <div>
              <label>Category</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full p-2 border rounded" required>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">{product ? 'Update' : 'Create'} Product</button>
            </div>
        </form>
    );
};


// Admin Products Page
const AdminProductsPage: React.FC = () => {
    const { products, categories, deleteProduct, loading } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const openModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    if (loading) return <Spinner/>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Manage Products</h1>
                <button onClick={() => openModal()} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Add Product</button>
            </div>
            <table className="w-full text-left">
                <thead><tr className="border-b"><th>Name</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                <tbody>
                    {products.map(p => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{p.name}</td>
                            <td className="p-2">${p.price.toFixed(2)}</td>
                            <td className="p-2">{p.stock}</td>
                            <td className="p-2 flex gap-2">
                                <button onClick={() => openModal(p)} className="text-blue-500"><PencilIcon /></button>
                                <button onClick={() => deleteProduct(p.id)} className="text-red-500"><TrashIcon /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add Product'}>
                <ProductForm product={editingProduct} onClose={closeModal} categories={categories} />
            </Modal>
        </div>
    );
};

// Admin Orders Page
const AdminOrdersPage: React.FC = () => {
    const { orders, updateOrderStatus, loading } = useAppContext();
    const statuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (loading) return <Spinner />;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Manage Orders</h1>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead><tr className="border-b"><th>ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} className="border-b hover:bg-gray-50">
                                <td className="p-2 font-mono text-sm">{o.id}</td>
                                <td className="p-2">{o.customerName}</td>
                                <td className="p-2">{o.createdAt.toLocaleDateString()}</td>
                                <td className="p-2">${o.total.toFixed(2)}</td>
                                <td className="p-2">
                                    <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)} className="p-1 border rounded">
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Admin Users Page
const AdminUsersPage: React.FC = () => {
    const { users, loading } = useAppContext();
    if (loading) return <Spinner />;
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
            <table className="w-full text-left">
                <thead><tr className="border-b"><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{u.name}</td>
                            <td className="p-2">{u.email}</td>
                            <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>{u.role}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


// Main Admin Router Component
export const Admin: React.FC = () => {
  const { user, loading } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  if (loading || !user || user.role !== 'admin') {
      return <Spinner />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Routes>
    </AdminLayout>
  );
};
