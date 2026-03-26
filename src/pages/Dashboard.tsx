import { DollarSign, Users, Package, ShoppingCart, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useDashboard } from "@/hooks/use-dashboard";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 200 80% 55%))",
  "hsl(var(--chart-3, 150 60% 45%))",
  "hsl(var(--chart-4, 40 90% 55%))",
  "hsl(var(--chart-5, 0 70% 55%))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#a4de6c",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  fontSize: "0.75rem",
};

const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const formatCurrency = (v: number) =>
  v.toLocaleString("tr-TR", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const Dashboard = () => {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground animate-pulse">Dashboard yükleniyor...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive font-medium">Dashboard verileri yüklenemedi.</p>
      </div>
    );
  }

  const { summary, monthlyOrders, topProducts, topCustomers, ordersByCountry, lowStockProducts } = data;

  const kpis = [
    { title: "Toplam Sipariş", value: summary.totalOrders.toLocaleString("tr-TR"), icon: ShoppingCart },
    { title: "Toplam Müşteri", value: summary.totalCustomers.toLocaleString("tr-TR"), icon: Users },
    { title: "Toplam Ürün", value: summary.totalProducts.toLocaleString("tr-TR"), icon: Package },
    { title: "Toplam Ciro", value: formatCurrency(summary.totalRevenue), icon: DollarSign },
  ];

  const monthlyChartData = monthlyOrders.map((m) => ({
    label: `${monthNames[m.month - 1]} ${m.year}`,
    orderCount: m.orderCount,
  }));

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Genel bakış</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={kpi.title} className="shadow-card border-border/50 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.title}</p>
                  <p className="text-2xl font-semibold text-foreground mt-1">{kpi.value}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Orders */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Aylık Sipariş Trendi</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="orderCount" name="Sipariş" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Country */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Ülkelere Göre Sipariş</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByCountry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="country" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="orderCount" name="Sipariş" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">En Çok Satan Ürünler</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Ürün</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Adet</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Ciro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p) => (
                  <TableRow key={p.productName} className="border-border/50">
                    <TableCell className="text-sm">{p.productName}</TableCell>
                    <TableCell className="text-sm text-right">{p.totalQuantity.toLocaleString("tr-TR")}</TableCell>
                    <TableCell className="text-sm text-right font-medium">{formatCurrency(p.totalRevenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="shadow-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">En Çok Sipariş Veren Müşteriler</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/50">
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Müşteri</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Sipariş</TableHead>
                  <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Harcama</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((c) => (
                  <TableRow key={c.customerId} className="border-border/50">
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {c.companyName.charAt(0)}
                        </div>
                        {c.companyName}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-right">{c.orderCount}</TableCell>
                    <TableCell className="text-sm text-right font-medium">{formatCurrency(c.totalSpent)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock */}
      <Card className="shadow-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Düşük Stok Uyarısı
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Ürün</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Stok</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Yeniden Sipariş Seviyesi</TableHead>
                <TableHead className="text-xs uppercase tracking-wider text-muted-foreground font-medium text-right">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.map((p) => (
                <TableRow key={p.productId} className="border-border/50">
                  <TableCell className="text-sm">{p.productName}</TableCell>
                  <TableCell className="text-sm text-right">{p.unitsInStock}</TableCell>
                  <TableCell className="text-sm text-right">{p.reorderLevel}</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      p.unitsInStock === 0
                        ? "bg-destructive/10 text-destructive"
                        : p.unitsInStock <= 5
                          ? "bg-warning/10 text-warning"
                          : "bg-yellow-500/10 text-yellow-600"
                    }`}>
                      {p.unitsInStock === 0 ? "Tükendi" : p.unitsInStock <= 5 ? "Kritik" : "Düşük"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
