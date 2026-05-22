import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Login from './pages/Login';
import Billing from './pages/Billing';
import Products from './pages/Products';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Configuration from './pages/Configuration';
import PrintReceipt from './pages/PrintReceipt';
import Navbar from './components/Navbar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/billing" />;
  
  return <>{children}</>;
};

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isPrintPage = location.pathname.startsWith('/print-receipt');
  
  return (
    <div className={isPrintPage ? "min-h-screen bg-slate-150" : "min-h-screen bg-gray-50 flex flex-col font-sans"}>
      {user && !isPrintPage && <Navbar />}
      <main className={isPrintPage ? "w-full" : (user ? "flex-1 container mx-auto p-4 lg:p-8" : "flex-1")}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/billing" />} />
          <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
          <Route path="/print-receipt/:id" element={<ProtectedRoute><PrintReceipt /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute roles={['Admin']}><Products /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute roles={['Admin']}><Inventory /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute roles={['Admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/config" element={<ProtectedRoute roles={['Admin']}><Configuration /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/billing" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
