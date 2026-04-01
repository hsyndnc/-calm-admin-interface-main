import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Suppliers from "./pages/Suppliers";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import ChatBot from "./components/ChatBot";

// Customer pages
import CustomerProducts from "./pages/customer/Products";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import CustomerOrders from "./pages/customer/Orders";
import CustomerOrderDetail from "./pages/customer/OrderDetail";

// Supplier pages
import SupplierDashboard from "./pages/supplier/Dashboard";
import SupplierProducts from "./pages/supplier/Products";
import SupplierOrders from "./pages/supplier/Orders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<RoleGuard roles={["Admin"]}><Dashboard /></RoleGuard>} />
                <Route path="products" element={<RoleGuard roles={["Admin", "User"]}><Products /></RoleGuard>} />
                <Route path="customers" element={<RoleGuard roles={["Admin"]}><Customers /></RoleGuard>} />
                <Route path="orders" element={<RoleGuard roles={["Admin"]}><Orders /></RoleGuard>} />
                <Route path="suppliers" element={<RoleGuard roles={["Admin"]}><Suppliers /></RoleGuard>} />
              </Route>
            </Route>

            {/* Customer */}
            <Route element={<ProtectedRoute />}>
              <Route path="/customer/products" element={<RoleGuard roles={["Customer"]}><CustomerProducts /></RoleGuard>} />
              <Route path="/customer/cart" element={<RoleGuard roles={["Customer"]}><Cart /></RoleGuard>} />
              <Route path="/customer/checkout" element={<RoleGuard roles={["Customer"]}><Checkout /></RoleGuard>} />
              <Route path="/customer/orders" element={<RoleGuard roles={["Customer"]}><CustomerOrders /></RoleGuard>} />
              <Route path="/customer/orders/:id" element={<RoleGuard roles={["Customer"]}><CustomerOrderDetail /></RoleGuard>} />
            </Route>

            {/* Supplier */}
            <Route element={<ProtectedRoute />}>
              <Route path="/supplier/dashboard" element={<RoleGuard roles={["Supplier"]}><SupplierDashboard /></RoleGuard>} />
              <Route path="/supplier/products" element={<RoleGuard roles={["Supplier"]}><SupplierProducts /></RoleGuard>} />
              <Route path="/supplier/orders" element={<RoleGuard roles={["Supplier"]}><SupplierOrders /></RoleGuard>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatBot />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
