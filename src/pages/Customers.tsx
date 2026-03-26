import { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  type Customer,
  type CustomerPayload,
} from "@/hooks/use-customers";
import { useToast } from "@/hooks/use-toast";

const emptyForm: CustomerPayload = {
  companyName: "",
  contactName: "",
  contactTitle: "",
  email: "",
  phone: "",
  city: "",
  country: "",
};

const Customers = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading, isError } = useCustomers(page, pageSize);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const customers: Customer[] = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const hasPreviousPage = data?.hasPreviousPage ?? false;
  const hasNextPage = data?.hasNextPage ?? false;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerPayload>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const openCreate = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      companyName: customer.companyName,
      contactName: customer.contactName,
      contactTitle: customer.contactTitle,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      country: customer.country,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.companyName.trim()) return;

    if (editingCustomer) {
      updateMutation.mutate(
        { original: editingCustomer, payload: form },
        {
          onSuccess: () => {
            toast({ title: "Customer updated successfully" });
            setDialogOpen(false);
          },
          onError: () => {
            toast({
              title: "Failed to update customer",
              variant: "destructive",
            });
          },
        },
      );
    } else {
      createMutation.mutate(form, {
        onSuccess: () => {
          toast({ title: "Customer created successfully" });
          setDialogOpen(false);
        },
        onError: () => {
          toast({
            title: "Failed to create customer",
            variant: "destructive",
          });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.customerId, {
      onSuccess: () => {
        toast({ title: "Customer deleted successfully" });
        setDeleteTarget(null);
      },
      onError: () => {
        toast({
          title: "Failed to delete customer",
          variant: "destructive",
        });
        setDeleteTarget(null);
      },
    });
  };

  const filtered = customers.filter(
    (c) =>
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName?.toLowerCase().includes(search.toLowerCase()),
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${totalCount} customers listed`}
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 bg-card border-border/50"
        />
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Company
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Contact
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Email
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Location
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
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-destructive font-medium"
                >
                  Error loading customers. Please try again later.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((customer, i) => (
                <TableRow
                  key={customer.customerId}
                  className="border-border/50 animate-fade-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-medium">
                          {customer.companyName
                            ?.substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm text-foreground">
                        {customer.companyName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.contactName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.email || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {customer.city}, {customer.country}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className="bg-success/10 text-success hover:bg-success/20 border-0 font-medium text-xs"
                    >
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(customer)}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(customer)}
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
                  No customers found.
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
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? "Update the customer details below."
                : "Fill in the details to create a new customer."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, companyName: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  value={form.contactName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactName: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactTitle">Contact Title</Label>
                <Input
                  id="contactTitle"
                  value={form.contactTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contactTitle: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, city: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, country: e.target.value }))
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
                : editingCustomer
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
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.companyName}
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

export default Customers;
