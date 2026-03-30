import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useCreateMyOrder } from "@/hooks/use-my-orders";
import { toast } from "sonner";

const schema = z.object({
  shipName: z.string().min(1, "Ad Soyad zorunludur"),
  shipAddress: z.string().min(1, "Adres zorunludur"),
  shipCity: z.string().min(1, "Şehir zorunludur"),
  shipCountry: z.string().min(1, "Ülke zorunludur"),
});

type FormValues = z.infer<typeof schema>;

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { mutateAsync: createOrder, isPending } = useCreateMyOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { shipCountry: "Turkey" },
  });

  if (items.length === 0) {
    navigate("/customer/cart");
    return null;
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await createOrder({
        shipName: values.shipName,
        shipAddress: values.shipAddress,
        shipCity: values.shipCity,
        shipCountry: values.shipCountry,
        items: items.map((i) => ({
          productId: i.product.productId,
          quantity: i.quantity,
          unitPrice: i.product.unitPrice,
          discount: 0,
        })),
      });
      clearCart();
      toast.success("Siparişiniz başarıyla oluşturuldu!");
      navigate("/customer/orders");
    } catch {
      toast.error("Sipariş oluşturulurken bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/customer/cart")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-semibold">Siparişi Tamamla</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teslimat Formu */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Teslimat Bilgileri</h2>
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Ad Soyad</Label>
              <Input {...register("shipName")} placeholder="Ad Soyad" />
              {errors.shipName && <p className="text-xs text-destructive">{errors.shipName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Adres</Label>
              <Input {...register("shipAddress")} placeholder="Sokak, Bina No" />
              {errors.shipAddress && <p className="text-xs text-destructive">{errors.shipAddress.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Şehir</Label>
                <Input {...register("shipCity")} placeholder="İstanbul" />
                {errors.shipCity && <p className="text-xs text-destructive">{errors.shipCity.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Ülke</Label>
                <Input {...register("shipCountry")} placeholder="Turkey" />
                {errors.shipCountry && <p className="text-xs text-destructive">{errors.shipCountry.message}</p>}
              </div>
            </div>
          </form>
        </div>

        {/* Sipariş Özeti */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
          <h2 className="font-semibold mb-4">Sipariş Özeti</h2>
          <div className="flex-1 space-y-2 mb-4">
            {items.map(({ product, quantity }) => (
              <div key={product.productId} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {product.productName} × {quantity}
                </span>
                <span>₺{(product.unitPrice * quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 mb-4">
            <div className="flex justify-between font-semibold">
              <span>Toplam</span>
              <span>₺{totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <Button
            form="checkout-form"
            type="submit"
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Sipariş veriliyor..." : "Sipariş Ver"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
