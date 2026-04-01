import { useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, ChevronDown, ChevronRight } from "lucide-react";
import { useSupplierOrders } from "@/hooks/use-supplier";
import ChatBot from "@/components/ChatBot";

const SupplierOrders = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const { data, isLoading } = useSupplierOrders(page, 10);

  const toggleExpand = (orderId: number) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

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
                    <th className="w-10 px-3 py-3"></th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sipariş #</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Müşteri</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tarih</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Tutar</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.items ?? []).map((order) => (
                    <Fragment key={order.orderId}>
                      <tr
                        className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                        onClick={() => toggleExpand(order.orderId)}
                      >
                        <td className="px-3 py-3 text-muted-foreground">
                          {expandedOrder === order.orderId ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">#{order.orderId}</td>
                        <td className="px-4 py-3 text-muted-foreground">{order.customerName ?? "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {order.totalAmount !== undefined && order.totalAmount !== null
                            ? `₺${order.totalAmount.toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.status === "Teslim Edildi"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {order.status ?? "—"}
                          </span>
                        </td>
                      </tr>
                      {expandedOrder === order.orderId && (
                        <tr key={`${order.orderId}-details`} className="border-b border-border bg-muted/20">
                          <td colSpan={6} className="px-6 py-4">
                            {order.orderDetails && order.orderDetails.length > 0 ? (
                              <div className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                                  Sipariş Detayları
                                </p>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-muted-foreground">
                                      <th className="text-left py-1 font-medium">Ürün</th>
                                      <th className="text-right py-1 font-medium">Birim Fiyat</th>
                                      <th className="text-right py-1 font-medium">Adet</th>
                                      <th className="text-right py-1 font-medium">İndirim</th>
                                      <th className="text-right py-1 font-medium">Toplam</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.orderDetails.map((detail) => {
                                      const lineTotal = detail.unitPrice * detail.quantity * (1 - detail.discount);
                                      return (
                                        <tr key={`${detail.orderId}-${detail.productId}`} className="border-t border-border/50">
                                          <td className="py-1.5">{detail.productName ?? `Ürün #${detail.productId}`}</td>
                                          <td className="text-right py-1.5">₺{detail.unitPrice.toFixed(2)}</td>
                                          <td className="text-right py-1.5">{detail.quantity}</td>
                                          <td className="text-right py-1.5">
                                            {detail.discount > 0 ? `%${(detail.discount * 100).toFixed(0)}` : "—"}
                                          </td>
                                          <td className="text-right py-1.5 font-medium">₺{lineTotal.toFixed(2)}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Detay bilgisi bulunamadı.</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
      <ChatBot />
    </div>
  );
};

export default SupplierOrders;
