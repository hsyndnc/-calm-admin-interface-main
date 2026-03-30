import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sepetiniz boş</h2>
          <p className="text-muted-foreground mb-6">Alışverişe başlamak için ürünler sayfasına gidin.</p>
          <Button onClick={() => navigate("/customer/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ürünlere Git
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/customer/products")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Sepetim</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {items.map(({ product, quantity }) => (
          <div
            key={product.productId}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{product.productName}</p>
              <p className="text-sm text-muted-foreground">₺{product.unitPrice.toFixed(2)} / adet</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(product.productId, quantity - 1)}
              >
                -
              </Button>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => updateQuantity(product.productId, parseInt(e.target.value) || 1)}
                className="w-14 h-8 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => updateQuantity(product.productId, quantity + 1)}
              >
                +
              </Button>
            </div>

            <div className="text-right min-w-[80px]">
              <p className="font-semibold">₺{(product.unitPrice * quantity).toFixed(2)}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => removeFromCart(product.productId)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {/* Toplam + Devam Et */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Toplam</span>
            <span className="text-xl font-bold">₺{totalPrice.toFixed(2)}</span>
          </div>
          <Button className="w-full" onClick={() => navigate("/customer/checkout")}>
            Siparişi Tamamla
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
