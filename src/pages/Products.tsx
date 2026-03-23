import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  deleteBrokenProducts,
  type Product,
  type ProductPayload,
} from "@/hooks/use-products";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const emptyForm: ProductPayload = {
  productName: "",
  quantityPerUnit: "",
  unitPrice: 0,
  unitsInStock: 0,
  unitsOnOrder: 0,
  reorderLevel: 0,
  discontinued: false,
  categoryId: undefined,
  supplierId: undefined,
};

const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.roles?.includes("Admin") ?? false;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useProducts(page, pageSize);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const products: Product[] = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasPreviousPage = data?.hasPreviousPage ?? false;
  const hasNextPage = data?.hasNextPage ?? false;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductPayload>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const queryClient = useQueryClient();
  const [repairing, setRepairing] = useState(false);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      productName: product.productName,
      quantityPerUnit: product.quantityPerUnit ?? "",
      unitPrice: product.unitPrice,
      unitsInStock: product.unitsInStock,
      unitsOnOrder: product.unitsOnOrder,
      reorderLevel: product.reorderLevel,
      discontinued: product.discontinued,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.productName.trim()) return;

    if (editingProduct) {
      updateMutation.mutate(
        { original: editingProduct, payload: form },
        {
          onSuccess: () => {
            toast({ title: "Product updated successfully" });
            setDialogOpen(false);
          },
          onError: () => {
            toast({ title: "Failed to update product", variant: "destructive" });
          },
        },
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => {
          toast({ title: "Product created successfully" });
          setDialogOpen(false);
        },
        onError: () => {
          toast({ title: "Failed to create product", variant: "destructive" });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.productId, {
      onSuccess: () => {
        toast({ title: "Product deleted successfully" });
        setDeleteTarget(null);
      },
      onError: () => {
        toast({ title: "Failed to delete product", variant: "destructive" });
        setDeleteTarget(null);
      },
    });
  };

  const filtered = products.filter((p) =>
    p.productName?.toLowerCase().includes(search.toLowerCase()),
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${totalCount} products listed`}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              disabled={repairing}
              onClick={async () => {
                setRepairing(true);
                try {
                  await deleteBrokenProducts();
                  queryClient.invalidateQueries({ queryKey: ["products"] });
                  toast({ title: "Bozuk ürünler düzeltildi!" });
                } catch {
                  toast({ title: "Düzeltme başarısız", variant: "destructive" });
                }
                setRepairing(false);
              }}
            >
              {repairing ? "Siliniyor..." : "Bozuk Ürünleri Sil"}
            </Button>
          )}
          {isAdmin && (
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Product
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Category
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Price
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Status
              </TableHead>
              {isAdmin && (
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground animate-pulse"
                >
                  Loading products...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-destructive font-medium"
                >
                  Error loading products. Please try again later.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((product, i) => (
                <TableRow
                  key={product.productId}
                  className="border-border/50 animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                        📦
                      </div>
                      <span className="font-medium text-sm text-foreground">
                        {product.productName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {product.categoryName || "Uncategorized"}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    ${product.unitPrice?.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.unitsInStock > 0 ? "default" : "destructive"
                      }
                      className={
                        product.unitsInStock > 0
                          ? "bg-success/10 text-success hover:bg-success/20 border-0 font-medium text-xs"
                          : "bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 font-medium text-xs"
                      }
                    >
                      {product.unitsInStock > 0
                        ? `In Stock (${product.unitsInStock})`
                        : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-12 text-muted-foreground"
                >
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Sayfa {page} / {totalPages} ({totalCount} kayit)
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPreviousPage}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 7) return true;
                  if (p === 1 || p === totalPages) return true;
                  if (Math.abs(p - page) <= 1) return true;
                  return false;
                })
                .reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) {
                    acc.push("ellipsis");
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "ellipsis" ? (
                    <span
                      key={`e-${i}`}
                      className="px-1 text-sm text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={item}
                      variant={page === item ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(item)}
                      className="h-8 w-8 p-0 text-xs"
                    >
                      {item}
                    </Button>
                  ),
                )}
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Update the product details below."
                : "Fill in the details to create a new product."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid gap-2">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={form.productName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, productName: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantityPerUnit">Quantity Per Unit</Label>
              <Input
                id="quantityPerUnit"
                value={form.quantityPerUnit ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, quantityPerUnit: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unitPrice">Unit Price</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.unitPrice}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      unitPrice: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unitsInStock">Units In Stock</Label>
                <Input
                  id="unitsInStock"
                  type="number"
                  min={0}
                  value={form.unitsInStock}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      unitsInStock: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="unitsOnOrder">Units On Order</Label>
                <Input
                  id="unitsOnOrder"
                  type="number"
                  min={0}
                  value={form.unitsOnOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      unitsOnOrder: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min={0}
                  value={form.reorderLevel}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      reorderLevel: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="categoryId">Category ID</Label>
                <Input
                  id="categoryId"
                  type="number"
                  min={0}
                  value={form.categoryId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      categoryId: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplierId">Supplier ID</Label>
                <Input
                  id="supplierId"
                  type="number"
                  min={0}
                  value={form.supplierId ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      supplierId: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="discontinued"
                type="checkbox"
                checked={form.discontinued}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discontinued: e.target.checked }))
                }
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="discontinued">Discontinued</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : editingProduct
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.productName}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;
