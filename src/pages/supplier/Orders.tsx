import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { useSupplierOrders } from "@/hooks/use-supplier";

const SupplierOrders = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSupplierOrders(page, 10);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/supplier/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Gelen Siparişler</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (data?.items ?? []).length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Henüz sipariş bulunmuyor.</p>
          </div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sipariş #</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Müşteri</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tarih</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Tutar</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.items ?? []).map((order) => (
                    <tr key={order.orderId} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">#{order.orderId}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.customerName ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {order.totalAmount !== undefined ? `₺${order.totalAmount.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{order.status ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={!data.hasPreviousPage} onClick={() => setPage((p) => p - 1)}>
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">{data.pageNumber} / {data.totalPages}</span>
                <Button variant="outline" size="sm" disabled={!data.hasNextPage} onClick={() => setPage((p) => p + 1)}>
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

export default SupplierOrders;
