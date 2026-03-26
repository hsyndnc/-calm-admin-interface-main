import React, { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCustomers, type Customer } from "@/hooks/use-customers";
import { useProducts, type Product } from "@/hooks/use-products";
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
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  Download,
} from "lucide-react";
import {
  useOrders,
  useCreateOrder,
  useUpdateOrder,
  useDeleteOrder,
  useOrderDetails,
  useCreateOrderDetail,
  useUpdateOrderDetail,
  useDeleteOrderDetail,
  useInvoice,
  useInvoicePdf,
  type Order,
  type OrderPayload,
  type OrderDetail,
  type OrderDetailPayload,
} from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";

const emptyDetailForm: OrderDetailPayload = {
  orderId: 0,
  productId: 0,
  unitPrice: 0,
  quantity: 1,
  discount: 0,
};

/* ---- Inline Order Details Panel ---- */
const OrderDetailsPanel = ({ order }: { order: Order }) => {
  const { data: details, isLoading } = useOrderDetails(order.orderId);
  const { data: invoice, isLoading: invoiceLoading } = useInvoice(order.orderId);
  const [showInvoice, setShowInvoice] = useState(false);
  const { data: pdfUrl, isLoading: pdfLoading } = useInvoicePdf(showInvoice && invoice?.success ? invoice.downloadUrl : null);
  const createDetail = useCreateOrderDetail();
  const updateDetail = useUpdateOrderDetail();
  const deleteDetail = useDeleteOrderDetail();
  const { toast } = useToast();

  const [detailForm, setDetailForm] = useState<OrderDetailPayload>({
    ...emptyDetailForm,
    orderId: order.orderId,
  });
  const [editingDetail, setEditingDetail] = useState<OrderDetail | null>(null);
  const [showForm, setShowForm] = useState(false);

  const openAdd = () => {
    setEditingDetail(null);
    setDetailForm({ ...emptyDetailForm, orderId: order.orderId });
    setShowForm(true);
  };

  const openEditDetail = (d: OrderDetail) => {
    setEditingDetail(d);
    setDetailForm({
      orderId: d.orderId,
      productId: d.productId,
      unitPrice: d.unitPrice,
      quantity: d.quantity,
      discount: d.discount,
    });
    setShowForm(true);
  };

  const handleSaveDetail = () => {
    if (!detailForm.productId || !detailForm.quantity) return;
    if (editingDetail) {
      updateDetail.mutate(
        { id: editingDetail.orderDetailId!, payload: detailForm },
        {
          onSuccess: () => {
            toast({ title: "Detail updated" });
            setShowForm(false);
          },
          onError: () => toast({ title: "Update failed", variant: "destructive" }),
        },
      );
    } else {
      createDetail.mutate(detailForm, {
        onSuccess: () => {
          toast({ title: "Detail added" });
          setShowForm(false);
        },
        onError: () => toast({ title: "Add failed", variant: "destructive" }),
      });
    }
  };

  const handleDeleteDetail = (d: OrderDetail) => {
    deleteDetail.mutate(
      { id: d.orderDetailId!, orderId: order.orderId },
      {
        onSuccess: () => toast({ title: "Detail deleted" }),
        onError: () => toast({ title: "Delete failed", variant: "destructive" }),
      },
    );
  };

  const isSavingDetail = createDetail.isPending || updateDetail.isPending;

  return (
    <div className="px-6 py-4 bg-muted/30 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Order Details — #{order.orderId}
        </h3>
        <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={openAdd}>
          <Plus className="w-3 h-3" /> Add Item
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground animate-pulse">Loading details...</p>
      ) : !details?.length ? (
        <p className="text-sm text-muted-foreground">No details found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Product ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Product</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Unit Price</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Quantity</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Discount</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Total</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((d) => (
              <TableRow key={d.orderDetailId ?? `${d.orderId}-${d.productId}`} className="border-border/50">
                <TableCell className="text-sm">{d.productId}</TableCell>
                <TableCell className="text-sm">{d.productName ?? "-"}</TableCell>
                <TableCell className="text-sm">${d.unitPrice.toFixed(2)}</TableCell>
                <TableCell className="text-sm">{d.quantity}</TableCell>
                <TableCell className="text-sm">{(d.discount * 100).toFixed(0)}%</TableCell>
                <TableCell className="text-sm font-medium">
                  ${(d.unitPrice * d.quantity * (1 - d.discount)).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditDetail(d)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDetail(d)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Invoice */}
      <div className="flex items-center gap-2">
        {invoiceLoading ? (
          <span className="text-xs text-muted-foreground animate-pulse">Fatura kontrol ediliyor...</span>
        ) : invoice?.success ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 h-7 text-xs"
            onClick={() => setShowInvoice((v) => !v)}
          >
            <FileText className="w-3 h-3" />
            {showInvoice ? "Faturayı Gizle" : "Faturayı Gör"}
          </Button>
        ) : null}
      </div>

      {showInvoice && invoice?.success && (
        <div className="border border-border/50 rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-foreground">Fatura</h4>
            </div>
            {invoice.invoiceNumber && (
              <span className="text-xs text-muted-foreground">#{invoice.invoiceNumber}</span>
            )}
          </div>
          {pdfLoading ? (
            <p className="text-sm text-muted-foreground animate-pulse">Fatura yükleniyor...</p>
          ) : pdfUrl ? (
            <div className="space-y-3">
              <iframe
                src={pdfUrl}
                className="w-full h-[500px] rounded border border-border/50"
                title={`Fatura #${invoice.invoiceNumber}`}
              />
              <a
                href={pdfUrl}
                download={`fatura-${invoice.invoiceNumber}.pdf`}
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Download className="w-4 h-4" />
                PDF İndir
              </a>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Fatura PDF'i yüklenemedi.</p>
          )}
        </div>
      )}

      {/* Inline Add / Edit form */}
      {showForm && (
        <div className="border border-border/50 rounded-lg p-4 bg-card space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">{editingDetail ? "Edit Item" : "Add Item"}</h4>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="grid gap-1">
              <Label className="text-xs">Product ID</Label>
              <Input
                type="number"
                value={detailForm.productId || ""}
                onChange={(e) => setDetailForm((f) => ({ ...f, productId: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Unit Price</Label>
              <Input
                type="number"
                step="0.01"
                value={detailForm.unitPrice || ""}
                onChange={(e) => setDetailForm((f) => ({ ...f, unitPrice: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Quantity</Label>
              <Input
                type="number"
                value={detailForm.quantity || ""}
                onChange={(e) => setDetailForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
              />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Discount</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={detailForm.discount}
                onChange={(e) => setDetailForm((f) => ({ ...f, discount: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} disabled={isSavingDetail}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveDetail} disabled={isSavingDetail}>
              {isSavingDetail ? "Saving..." : editingDetail ? "Update" : "Add"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const emptyForm: OrderPayload = {
  customerId: "",
  customerEmail: "",
  orderDate: new Date().toISOString().split("T")[0],
  requiredDate: undefined,
  shippedDate: undefined,
  shipVia: 1,
  freight: 0,
  shipName: "",
  shipAddress: "",
  shipCity: "",
  shipCountry: "",
};

const Orders = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useOrders(page, pageSize);
  const { data: customersData } = useCustomers(1, 1000);
  const customers: Customer[] = useMemo(() => customersData?.items ?? [], [customersData]);
  const { data: productsData } = useProducts(1, 1000);
  const products: Product[] = useMemo(() => productsData?.items ?? [], [productsData]);
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
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [customerComboOpen, setCustomerComboOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [orderItems, setOrderItems] = useState<OrderDetailPayload[]>([]);
  const [productDropdownIdx, setProductDropdownIdx] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const createDetailMutation = useCreateOrderDetail();

  const openCreate = () => {
    setEditingOrder(null);
    setForm({
      ...emptyForm,
      orderDate: new Date().toISOString().split("T")[0],
    });
    setOrderItems([]);
    setDialogOpen(true);
  };

  const openEdit = (order: Order) => {
    setEditingOrder(order);
    setForm({
      customerId: order.customerId,
      customerEmail: order.customerEmail ?? "",
      orderDate: order.orderDate?.split("T")[0] ?? "",
      requiredDate: order.requiredDate?.split("T")[0] ?? undefined,
      shippedDate: order.shippedDate?.split("T")[0] ?? undefined,
      shipVia: order.shipVia ?? 1,
      freight: order.freight ?? 0,
      shipName: order.shipName ?? "",
      shipAddress: order.shipAddress ?? "",
      shipCity: order.shipCity ?? "",
      shipCountry: order.shipCountry ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.customerId?.trim()) {
      toast({ title: "Please select a customer", variant: "destructive" });
      return;
    }

    if (editingOrder) {
      updateMutation.mutate(
        { original: editingOrder, payload: form },
        {
          onSuccess: () => {
            toast({ title: "Order updated successfully" });
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast({ title: err?.response?.data?.title || "Failed to update order", variant: "destructive" });
          },
        },
      );
    } else {
      const payload = {
        ...form,
        orderDetails: orderItems.map((item) => ({
          productId: item.productId,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          discount: item.discount,
        })),
      };
      createMutation.mutate(payload as any, {
        onSuccess: () => {
          toast({ title: "Order created successfully" });
          setDialogOpen(false);
        },
        onError: (err: any) => {
          const data = err?.response?.data;
          const errors = data?.errors;
          let msg = data?.title || "Failed to create order";
          if (errors) {
            const details = Object.entries(errors).map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`).join(" | ");
            msg += ` — ${details}`;
          }
          console.error("Create order error:", data);
          toast({ title: msg, variant: "destructive" });
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

  const getStatusBadge = (order: { shippedDate?: string | null }) => {
    const shipped = order.shippedDate ? new Date(order.shippedDate) : null;
    const isValid = shipped && shipped.getFullYear() > 1900;

    if (isValid && shipped <= new Date()) {
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/20 border-0 font-medium text-xs">
          Shipped
        </Badge>
      );
    }
    if (isValid && shipped > new Date()) {
      return (
        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-0 font-medium text-xs">
          Scheduled
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
              filtered.map((order, i) => {
                const isExpanded = expandedOrderId === order.orderId;
                return (
                  <React.Fragment key={order.orderId}>
                    <TableRow
                      className={`border-border/50 animate-fade-in cursor-pointer ${isExpanded ? "bg-muted/20" : ""}`}
                      style={{ animationDelay: `${i * 50}ms` }}
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.orderId)
                      }
                    >
                      <TableCell className="font-medium text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                          />
                          #{order.orderId}
                        </div>
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
                            onClick={(e) => { e.stopPropagation(); openEdit(order); }}
                            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(order); }}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="p-0">
                          <OrderDetailsPanel order={order} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="grid gap-2 relative">
              <Label>Customer</Label>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between font-normal"
                  onClick={() => {
                    setCustomerComboOpen((v) => !v);
                    setCustomerSearch("");
                  }}
                >
                  {form.customerId
                    ? customers.find((c) => c.customerId === form.customerId)?.companyName ?? form.customerId
                    : "Select customer..."}
                  <ChevronDown className={`ml-2 h-4 w-4 shrink-0 opacity-50 transition-transform ${customerComboOpen ? "rotate-180" : ""}`} />
                </Button>
                {customerComboOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
                    <div className="p-2 border-b border-border">
                      <Input
                        placeholder="Search customer..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {customers
                        .filter((c) =>
                          c.companyName.toLocaleLowerCase("tr-TR").includes(customerSearch.toLocaleLowerCase("tr-TR"))
                        )
                        .map((c) => (
                          <button
                            key={c.customerId}
                            type="button"
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between ${form.customerId === c.customerId ? "bg-accent/50" : ""}`}
                            onClick={() => {
                              setForm((f) => ({ ...f, customerId: c.customerId, customerEmail: c.email || "", shipName: c.companyName }));
                              setCustomerComboOpen(false);
                            }}
                          >
                            <span className="font-medium">{c.companyName}</span>
                            <span className="text-xs text-muted-foreground">{c.customerId}</span>
                          </button>
                        ))}
                      {customers.filter((c) =>
                        c.companyName.toLocaleLowerCase("tr-TR").includes(customerSearch.toLocaleLowerCase("tr-TR"))
                      ).length === 0 && (
                        <p className="px-3 py-4 text-sm text-muted-foreground text-center">No customer found.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="requiredDate">Required Date</Label>
                <Input
                  id="requiredDate"
                  type="date"
                  value={form.requiredDate?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      requiredDate: e.target.value || undefined,
                    }))
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
                <Label htmlFor="shipVia">Ship Via</Label>
                <select
                  id="shipVia"
                  value={form.shipVia ?? 1}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shipVia: Number(e.target.value) }))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value={1}>Speedy Express</option>
                  <option value={2}>United Package</option>
                  <option value={3}>Federal Shipping</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="freight">Freight</Label>
                <Input
                  id="freight"
                  type="number"
                  step="0.01"
                  value={form.freight ?? 0}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, freight: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="shipName">Ship Name</Label>
                <Input
                  id="shipName"
                  value={form.shipName ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shipName: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shipAddress">Ship Address</Label>
                <Input
                  id="shipAddress"
                  value={form.shipAddress ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, shipAddress: e.target.value }))
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

            {/* Order Items */}
            {!editingOrder && (
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1 h-7 text-xs"
                    onClick={() =>
                      setOrderItems((items) => [
                        ...items,
                        { orderId: 0, productId: 0, unitPrice: 0, quantity: 1, discount: 0 },
                      ])
                    }
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </Button>
                </div>
                {orderItems.length === 0 && (
                  <p className="text-sm text-muted-foreground">No items added yet.</p>
                )}
                <div className="space-y-4">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="grid gap-1 flex-1 relative">
                          <Label className="text-xs">Product</Label>
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between font-normal h-9 text-sm"
                            onClick={() => {
                              setProductDropdownIdx(productDropdownIdx === idx ? null : idx);
                              setProductSearch("");
                            }}
                          >
                            <span className="truncate">
                              {item.productId
                                ? products.find((p) => p.productId === item.productId)?.productName ?? `#${item.productId}`
                                : "Select product..."}
                            </span>
                            <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                          </Button>
                          {productDropdownIdx === idx && (
                            <div className="absolute z-[100] top-full mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
                              <div className="p-2 border-b border-border">
                                <Input
                                  placeholder="Search product..."
                                  value={productSearch}
                                  onChange={(e) => setProductSearch(e.target.value)}
                                  autoFocus
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="max-h-52 overflow-y-auto">
                                {products
                                  .filter((p) =>
                                    p.productName.toLocaleLowerCase("tr-TR").includes(productSearch.toLocaleLowerCase("tr-TR"))
                                  )
                                  .map((p) => (
                                    <button
                                      key={p.productId}
                                      type="button"
                                      className={`w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between ${item.productId === p.productId ? "bg-accent/50" : ""}`}
                                      onClick={() => {
                                        setOrderItems((items) =>
                                          items.map((it, i) =>
                                            i === idx ? { ...it, productId: p.productId, unitPrice: p.unitPrice } : it,
                                          ),
                                        );
                                        setProductDropdownIdx(null);
                                      }}
                                    >
                                      <span className="font-medium truncate">{p.productName}</span>
                                      <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">${p.unitPrice.toFixed(2)}</span>
                                    </button>
                                  ))}
                                {products.filter((p) =>
                                  p.productName.toLocaleLowerCase("tr-TR").includes(productSearch.toLocaleLowerCase("tr-TR"))
                                ).length === 0 && (
                                  <p className="px-3 py-3 text-sm text-muted-foreground text-center">No product found.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors mt-5"
                          onClick={() => setOrderItems((items) => items.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="grid gap-1">
                          <Label className="text-xs">Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice || ""}
                            onChange={(e) =>
                              setOrderItems((items) =>
                                items.map((it, i) => i === idx ? { ...it, unitPrice: Number(e.target.value) } : it),
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity || ""}
                            onChange={(e) =>
                              setOrderItems((items) =>
                                items.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it),
                              )
                            }
                          />
                        </div>
                        <div className="grid gap-1">
                          <Label className="text-xs">Discount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={item.discount}
                            onChange={(e) =>
                              setOrderItems((items) =>
                                items.map((it, i) => i === idx ? { ...it, discount: Number(e.target.value) } : it),
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
