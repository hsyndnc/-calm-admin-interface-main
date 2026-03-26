import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface DashboardSummary {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
}

export interface MonthlyOrder {
  year: number;
  month: number;
  orderCount: number;
  revenue: number;
}

export interface TopProduct {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface TopCustomer {
  customerId: string;
  companyName: string;
  orderCount: number;
  totalSpent: number;
}

export interface OrderByCountry {
  country: string;
  orderCount: number;
}

export interface LowStockProduct {
  productId: number;
  productName: string;
  unitsInStock: number;
  reorderLevel: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  monthlyOrders: MonthlyOrder[];
  topProducts: TopProduct[];
  topCustomers: TopCustomer[];
  ordersByCountry: OrderByCountry[];
  lowStockProducts: LowStockProduct[];
}

const fetchDashboard = async (): Promise<DashboardData> => {
  const { data } = await apiClient.get("api/dashboard");
  return data;
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
  });
};
