import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Search } from "lucide-react";
import { useCustomerProducts, useCategories } from "@/hooks/use-customer-products";
import { useCart } from "@/hooks/use-cart";
import CustomerLayout from "@/components/CustomerLayout";
import { toast } from "sonner";
import type { Product } from "@/hooks/use-products";

const CustomerProducts = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();

  const { data, isLoading } = useCustomerProducts(page, 12, categoryId, search);
  const { data: categories } = useCategories();
  const { addToCart } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (id?: number) => {
    setCategoryId(id);
    setPage(1);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success(`${product.productName} sepete eklendi`);
  };

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Arama + Kategori */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ürün ara..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit">Ara</Button>
          </form>
        </div>

        {/* Kategori filtreleri */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={!categoryId ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(undefined)}
            >
              Tümü
            </Button>
            {categories.map((c) => (
              <Button
                key={c.categoryId}
                variant={categoryId === c.categoryId ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(c.categoryId)}
              >
                {c.categoryName}
              </Button>
            ))}
          </div>
        )}

        {/* Ürün Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(data?.items ?? []).map((product) => (
                <div
                  key={product.productId}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3"
                >
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>
                    <h3 className="font-medium text-foreground text-sm leading-tight">
                      {product.productName}
                    </h3>
                    {product.quantityPerUnit && (
                      <p className="text-xs text-muted-foreground mt-1">{product.quantityPerUnit}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      ₺{product.unitPrice.toFixed(2)}
                    </span>
                    <Badge variant={product.unitsInStock > 0 ? "secondary" : "destructive"} className="text-xs">
                      {product.unitsInStock > 0 ? `${product.unitsInStock} stok` : "Stokta yok"}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={product.unitsInStock === 0}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Sepete Ekle
                  </Button>
                </div>
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
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
    </CustomerLayout>
  );
};

export default CustomerProducts;
