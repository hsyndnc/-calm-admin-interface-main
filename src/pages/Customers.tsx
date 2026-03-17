import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useCustomers } from "@/hooks/use-customers";

const Customers = () => {
  const [search, setSearch] = useState("");
  const { data: customers = [], isLoading, isError } = useCustomers();

  const filtered = customers.filter(
    (c) =>
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your customer base</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 bg-card border-border/50"
        />
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Company</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Contact</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Location</TableHead>
              <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground animate-pulse">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-destructive font-medium">
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
                          {customer.companyName?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm text-foreground">{customer.companyName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{customer.contactName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{customer.city}, {customer.country}</TableCell>
                  <TableCell>
                    <Badge
                      variant="default"
                      className="bg-success/10 text-success hover:bg-success/20 border-0 font-medium text-xs"
                    >
                      Active
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Customers;
