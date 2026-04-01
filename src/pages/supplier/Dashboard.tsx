import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, ShoppingBag, AlertTriangle, LogOut } from "lucide-react";
import { useSupplierStats } from "@/hooks/use-supplier";
import { useAuth } from "@/contexts/AuthContext";


const SupplierDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { data: stats, isLoading } = useSupplierStats();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Tedarikçi Paneli</h1>
            <p className="text-sm text-muted-foreground">{user?.fullName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/supplier/products")}>
              <Package className="w-4 h-4 mr-2" />
              Ürünlerim
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/supplier/orders")}>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Siparişler
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Ürün</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "—" : stats?.totalProducts ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Sipariş</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "—" : stats?.totalOrders ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kritik Stok</p>
                <p className="text-2xl font-bold">
                  {isLoading ? "—" : stats?.lowStockProducts?.length ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kritik Stok Uyarıları */}
        {!isLoading && stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h2 className="font-semibold">Kritik Stok Uyarıları</h2>
            </div>
            <div className="space-y-2">
              {stats.lowStockProducts.map((p) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm font-medium">{p.productName}</span>
                  <span className="text-sm text-orange-500 font-medium">
                    {p.unitsInStock} adet kaldı
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard;
