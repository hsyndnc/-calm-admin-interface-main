import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronRight, ArrowLeft } from "lucide-react";
import { useMyOrders } from "@/hooks/use-my-orders";

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyOrders(page, 10);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/customer/products")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Siparişlerim</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))
        ) : (data?.items ?? []).length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Henüz sipariş bulunmuyor.</p>
            <Button className="mt-4" onClick={() => navigate("/customer/products")}>
              Alışverişe Başla
            </Button>
          </div>
        ) : (
          <>
            {(data?.items ?? []).map((order) => (
              <button
                key={order.orderId}
                onClick={() => navigate(`/customer/orders/${order.orderId}`)}
                className="w-full bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:bg-accent transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground">Sipariş #{order.orderId}</span>
                    {order.status && (
                      <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                    {order.shipCity && ` — ${order.shipCity}`}
                  </p>
                </div>
                {order.totalAmount !== undefined && (
                  <span className="font-semibold text-foreground">
                    ₺{order.totalAmount.toFixed(2)}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.hasPreviousPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">
                  {data.pageNumber} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
