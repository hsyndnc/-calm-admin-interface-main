import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import {
  useSupplierProducts,
  useCreateSupplierProduct,
  useUpdateSupplierProduct,
  useDeleteSupplierProduct,
} from "@/hooks/use-supplier";
import type { Product, ProductPayload } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-customer-products";
import { toast } from "sonner";

const schema = z.object({
  productName: z.string().min(1, "Ürün adı zorunludur"),
  unitPrice: z.coerce.number().min(0, "Fiyat 0 veya üzeri olmalıdır"),
  unitsInStock: z.coerce.number().min(0),
  unitsOnOrder: z.coerce.number().min(0),
  reorderLevel: z.coerce.number().min(0),
  quantityPerUnit: z.string().optional(),
  categoryId: z.coerce.number().min(1, "Kategori seçimi zorunludur"),
  discontinued: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

const SupplierProducts = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data, isLoading } = useSupplierProducts(page, 10);
  const { data: categories = [] } = useCategories();
  const { mutateAsync: createProduct, isPending: creating } = useCreateSupplierProduct();
  const { mutateAsync: updateProduct, isPending: updating } = useUpdateSupplierProduct();
  const { mutateAsync: deleteProduct } = useDeleteSupplierProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    setEditing(null);
    reset({ productName: "", unitPrice: 0, unitsInStock: 0, unitsOnOrder: 0, reorderLevel: 0, categoryId: 0, discontinued: false });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    reset({
      productName: product.productName,
      unitPrice: product.unitPrice,
      unitsInStock: product.unitsInStock,
      unitsOnOrder: product.unitsOnOrder,
      reorderLevel: product.reorderLevel,
      quantityPerUnit: product.quantityPerUnit ?? "",
      categoryId: product.categoryId ?? 0,
      discontinued: product.discontinued,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (values: FormValues) => {
    const payload: ProductPayload = {
      productName: values.productName,
      unitPrice: values.unitPrice,
      unitsInStock: values.unitsInStock,
      unitsOnOrder: values.unitsOnOrder,
      reorderLevel: values.reorderLevel,
      quantityPerUnit: values.quantityPerUnit ?? "",
      categoryId: values.categoryId,
      supplierId: 0,
      discontinued: values.discontinued,
    };
    try {
      if (editing) {
        await updateProduct({ id: editing.productId, payload });
        toast.success("Ürün güncellendi");
      } else {
        await createProduct(payload);
        toast.success("Ürün oluşturuldu");
      }
      setDialogOpen(false);
    } catch {
      toast.error("İşlem sırasında bir hata oluştu");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteProduct(deleteId);
      toast.success("Ürün silindi");
    } catch {
      toast.error("Silme işlemi başarısız");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/supplier/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">Ürünlerim</h1>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Yeni Ürün
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ürün Adı</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Fiyat</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Stok</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Durum</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {(data?.items ?? []).map((product) => (
                    <tr key={product.productId} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{product.productName}</td>
                      <td className="px-4 py-3 text-right">${product.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{product.unitsInStock}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={product.discontinued ? "destructive" : "secondary"}>
                          {product.discontinued ? "Pasif" : "Aktif"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(product.productId)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Ürünü Düzenle" : "Yeni Ürün"}</DialogTitle>
          </DialogHeader>
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <Label>Ürün Adı</Label>
              <Input {...register("productName")} />
              {errors.productName && <p className="text-xs text-destructive">{errors.productName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fiyat ($)</Label>
                <Input type="number" step="0.01" {...register("unitPrice")} />
                {errors.unitPrice && <p className="text-xs text-destructive">{errors.unitPrice.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Stok</Label>
                <Input type="number" {...register("unitsInStock")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Siparişteki</Label>
                <Input type="number" {...register("unitsOnOrder")} />
              </div>
              <div className="space-y-1">
                <Label>Reorder Seviye</Label>
                <Input type="number" {...register("reorderLevel")} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Birim Açıklaması</Label>
              <Input {...register("quantityPerUnit")} placeholder="Örn: 12 adet" />
            </div>
            <div className="space-y-1">
              <Label>Kategori</Label>
              <select
                {...register("categoryId")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Kategori seçin</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>İptal</Button>
            <Button form="product-form" type="submit" disabled={creating || updating}>
              {creating || updating ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürünü sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SupplierProducts;
