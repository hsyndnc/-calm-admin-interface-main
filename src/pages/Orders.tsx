import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders } from "@/hooks/use-orders";

const Orders = () => {
  const [search, setSearch] = useState("");
  const { data: orders = [], isLoading, isError } = useOrders();

  const filtered = orders.filter(
    (o) =>
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.orderId?.toString().includes(search)
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

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${orders.length} orders listed`}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search by customer or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 w-72"
        />
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Order ID</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Customer</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Date</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Destination</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground animate-pulse">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-destructive font-medium">
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
                  <TableCell className="font-medium text-sm text-foreground">#{order.orderId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {order.customerName?.charAt(0) || "?"}
                      </div>
                      <span className="text-sm text-foreground">{order.customerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {[order.shipCity, order.shipCountry].filter(Boolean).join(", ") || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(order)}</TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Orders;
