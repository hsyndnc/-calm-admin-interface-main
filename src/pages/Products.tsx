import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducts } from "@/hooks/use-products";
import { useAuth } from "@/contexts/AuthContext";

const Products = () => {
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("Admin") ?? false;
  const [search, setSearch] = useState("");
  const { data: products = [], isLoading, isError } = useProducts();

  const filtered = products.filter(
    (p) =>
      p.productName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${products.length} products listed`}
          </p>
        </div>
        {isAdmin && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        )}
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Product</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Category</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Price</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</TableHead>
              {isAdmin && <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground animate-pulse">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-destructive font-medium">
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
                      <span className="font-medium text-sm text-foreground">{product.productName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.categoryName || "Uncategorized"}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">${product.unitPrice?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={product.unitsInStock > 0 ? "default" : "destructive"}
                      className={
                        product.unitsInStock > 0
                          ? "bg-success/10 text-success hover:bg-success/20 border-0 font-medium text-xs"
                          : "bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 font-medium text-xs"
                      }
                    >
                      {product.unitsInStock > 0 ? `In Stock (${product.unitsInStock})` : "Out of Stock"}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
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
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Products;
