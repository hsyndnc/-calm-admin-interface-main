import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { CheckCircle, Trash2, Building2 } from "lucide-react";
import { useSuppliers, useApproveSupplier, useDeleteSupplier } from "@/hooks/use-suppliers";
import { toast } from "sonner";

const Suppliers = () => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: suppliers, isLoading } = useSuppliers();
  const { mutateAsync: approveSupplier } = useApproveSupplier();
  const { mutateAsync: deleteSupplier } = useDeleteSupplier();

  const pending = (suppliers ?? []).filter((s) => !s.isApproved);
  const approved = (suppliers ?? []).filter((s) => s.isApproved);

  const handleApprove = async (userId: string) => {
    try {
      await approveSupplier(userId);
      toast.success("Tedarikçi onaylandı");
    } catch {
      toast.error("Onaylama işlemi başarısız");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSupplier(deleteId);
      toast.success("Tedarikçi silindi");
    } catch {
      toast.error("Silme işlemi başarısız");
    } finally {
      setDeleteId(null);
    }
  };

  const SupplierRow = ({ supplier }: { supplier: typeof approved[0] }) => (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Building2 className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{supplier.fullName}</p>
        <p className="text-xs text-muted-foreground truncate">{supplier.email}</p>
        {supplier.company && (
          <p className="text-xs text-muted-foreground">{supplier.company}</p>
        )}
      </div>
      <Badge variant={supplier.isApproved ? "secondary" : "outline"} className="flex-shrink-0">
        {supplier.isApproved ? "Onaylı" : "Bekliyor"}
      </Badge>
      <div className="flex items-center gap-1">
        {!supplier.isApproved && (
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
            onClick={() => handleApprove(supplier.userId)}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Onayla
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => setDeleteId(supplier.userId)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tedarikçiler</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Tedarikçi hesaplarını yönetin ve onay bekleyenleri onaylayın.
        </p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Onay Bekleyenler
            {pending.length > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Onaylılar</TabsTrigger>
          <TabsTrigger value="all">Tümü</TabsTrigger>
        </TabsList>

        <div className="mt-4 bg-card border border-border rounded-xl">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="pending" className="p-4 m-0">
                {pending.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Onay bekleyen tedarikçi yok.
                  </p>
                ) : (
                  pending.map((s) => <SupplierRow key={s.userId} supplier={s} />)
                )}
              </TabsContent>

              <TabsContent value="approved" className="p-4 m-0">
                {approved.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Onaylı tedarikçi yok.
                  </p>
                ) : (
                  approved.map((s) => <SupplierRow key={s.userId} supplier={s} />)
                )}
              </TabsContent>

              <TabsContent value="all" className="p-4 m-0">
                {(suppliers ?? []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    Henüz tedarikçi yok.
                  </p>
                ) : (
                  (suppliers ?? []).map((s) => <SupplierRow key={s.userId} supplier={s} />)
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tedarikçiyi sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu tedarikçiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

export default Suppliers;
