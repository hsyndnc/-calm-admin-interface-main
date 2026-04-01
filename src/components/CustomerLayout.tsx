import { useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, ClipboardList, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/use-cart";
import ChatBot from "@/components/ChatBot";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { totalItems } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <NavLink
              to="/customer/products"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Ürünler</span>
            </NavLink>
            <NavLink
              to="/customer/orders"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Siparişlerim</span>
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/customer/cart"
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Sepet</span>
              {totalItems > 0 && (
                <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {totalItems}
                </Badge>
              )}
            </NavLink>

            <div className="hidden sm:block text-sm text-muted-foreground border-l border-border pl-3 ml-1">
              {user?.fullName}
            </div>

            <Button variant="ghost" size="icon" onClick={handleLogout} title="Çıkış Yap">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>
      <ChatBot />
    </div>
  );
};

export default CustomerLayout;
