import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useOrders,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
  type Order,
  type OrderPayload,
} from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";

const emptyForm: OrderPayload = {
  customerId: "",
  orderDate: new Date().toISOString().split("T")[0],
  shippedDate: undefined,
  shipCity: "",
  shipCountry: "",
};

const Orders = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useOrders(page, pageSize);
  const createMutation = useCreateOrder();
  const updateMutation = useUpdateOrder();
  const deleteMutation = useDeleteOrder();

  const orders: Order[] = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasPreviousPage = data?.hasPreviousPage ?? false;
  const hasNextPage = data?.hasNextPage ?? false;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderPayload>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);

  const openCreate = () => {
    setEditingOrder(null);
    setForm({
      ...emptyForm,
      orderDate: new Date().toISOString().split("T")[0],
    });
    setDialogOpen(true);
  };

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setForm({
      customerId: order.customerId,
      orderDate: order.orderDate?.split("T")[0] ?? "",
      shippedDate: order.shippedDate?.split("T")[0] ?? undefined,
      shipCity: order.shipCity ?? "",
      shipCountry: order.shipCountry ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.customerId.trim()) return;

    if (editingOrder) {
      updateMutation.mutate(
        { original: editingOrder, payload: form },
        {
          onSuccess: () => {
            toast({ title: "Order updated successfully" });
            setDialogOpen(false);
          },
          onError: () => {
            toast({ title: "Failed to update order", variant: "destructive" });
          },
        },
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => {
          toast({ title: "Order created successfully" });
          setDialogOpen(false);
        },
        onError: () => {
          toast({ title: "Failed to create order", variant: "destructive" });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.orderId, {
      onSuccess: () => {
        toast({ title: "Order deleted successfully" });
        setDeleteTarget(null);
      },
      onError: () => {
        toast({ title: "Failed to delete order", variant: "destructive" });
        setDeleteTarget(null);
      },
    });
  };

  const filtered = orders.filter(
    (o) =>
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.orderId?.toString().includes(search),
  );

  const getStatusBadge = (order: { shippedDate?: string }) => {
    if (order.shippedDate) {
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/20 border-0 font-medium text-xs">
          Shipped
        </Badge>
      );
    }
    return (
      <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0 font-medium text-xs">
        Pending
      </Badge>
    );
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${totalCount} orders listed`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by customer or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-72"
          />
          <Button className="gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add Order
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Order ID
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Customer
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Date
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Destination
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Status
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground animate-pulse"
                >
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-destructive font-medium"
                >
                  Error loading orders. Please try again later.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((order, i) => (
                <TableRow
                  key={order.orderId}
                  className="border-border/50 animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <TableCell className="font-medium text-sm text-foreground">
                    #{order.orderId}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {order.customerName?.charAt(0) || "?"}
                      </div>
                      <span className="text-sm text-foreground">
                        {order.customerName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[order.shipCity, order.shipCountry]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(order)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(order)}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(order)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-muted-foreground"
                >
                  No orders found.
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
              {editingOrder ? "Edit Order" : "Add Order"}
            </DialogTitle>
            <DialogDescription>
              {editingOrder
                ? "Update the order details below."
                : "Fill in the details to create a new order."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                value={form.customerId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customerId: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="orderDate">Order Date</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={form.orderDate?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, orderDate: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shippedDate">Shipped Date</Label>
                <Input
                  id="shippedDate"
                  type="date"
                  value={form.shippedDate?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      shippedDate: e.target.value || undefined,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="shipCity">Ship City</Label>
                <Input
                  id="shipCity"
                  value={form.shipCity ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shipCity: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shipCountry">Ship Country</Label>
                <Input
                  id="shipCountry"
                  value={form.shipCountry ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shipCountry: e.target.value }))
                  }
                />
              </div>
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
                : editingOrder
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
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order #{deleteTarget?.orderId}?
              This action cannot be undone.
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

export default Orders;
