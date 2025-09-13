
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ShoppingBagIcon, UserCircleIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, CubeIcon } from './ui';

const Header: React.FC = () => {
  const { user, logout, cart } = useAppContext();
  const location = useLocation();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-primary-600 hover:text-primary-800">
               <CubeIcon className="h-8 w-8" />
              <span className="text-xl font-bold">Gemini E-Comm</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/cart" className="relative text-gray-500 hover:text-primary-600 p-2">
              <ShoppingBagIcon className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <span className="text-gray-600 hidden sm:inline">Welcome, {user.name}!</span>
                {user.role === 'admin' && !isAdminPage && (
                  <Link to="/admin" className="text-gray-500 hover:text-primary-600 p-2" title="Admin Dashboard">
                    <Cog6ToothIcon className="h-6 w-6" />
                  </Link>
                )}
                <button onClick={logout} className="text-gray-500 hover:text-primary-600 p-2" title="Logout">
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </>
            ) : (
              <Link to="/login" className="text-gray-500 hover:text-primary-600 p-2" title="Login">
                <UserCircleIcon className="h-6 w-6" />
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Gemini E-Commerce Pro. All rights reserved.</p>
      </div>
    </footer>
  );
};

const Notification: React.FC = () => {
    const { notification } = useAppContext();

    if (!notification) return null;

    return (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-bounce">
            {notification}
        </div>
    );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
      <Notification />
    </div>
  );
};
