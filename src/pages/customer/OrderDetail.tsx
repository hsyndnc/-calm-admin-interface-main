import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { useOrderById } from "@/hooks/use-my-orders";

interface OrderDetailItem {
  productId: number;
  productName?: string;
  unitPrice: number;
  quantity: number;
  discount: number;
}

const CustomerOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading } = useOrderById(id ? parseInt(id) : null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Sipariş bulunamadı.</p>
      </div>
    );
  }

  const details = (order.details ?? []) as OrderDetailItem[];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/customer/orders")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Sipariş #{order.orderId}</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Sipariş Bilgileri */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <h2 className="font-semibold">Sipariş Bilgileri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-muted-foreground">Sipariş Tarihi</p>
                <p className="font-medium">
                  {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                </p>
              </div>
            </div>
            {order.shippedDate && (
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Kargo Tarihi</p>
                  <p className="font-medium">
                    {new Date(order.shippedDate).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
            )}
            {(order.shipAddress || order.shipCity) && (
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-muted-foreground">Teslimat Adresi</p>
                  <p className="font-medium">
                    {[order.shipAddress, order.shipCity, order.shipCountry]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ürünler */}
        {details.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold mb-4">Ürünler</h2>
            <div className="space-y-3">
              {details.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.productName ?? `Ürün #${item.productId}`}</p>
                    <p className="text-muted-foreground">
                      {item.quantity} adet × ₺{item.unitPrice.toFixed(2)}
                      {item.discount > 0 && ` (${(item.discount * 100).toFixed(0)}% indirim)`}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ₺{(item.unitPrice * item.quantity * (1 - item.discount)).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            {order.totalAmount !== undefined && (
              <div className="border-t border-border mt-4 pt-3 flex justify-between font-semibold">
                <span>Toplam</span>
                <span>₺{order.totalAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrderDetail;
