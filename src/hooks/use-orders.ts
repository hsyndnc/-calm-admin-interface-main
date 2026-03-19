import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface Order {
  orderId: number;
  customerId: string;
  customerName: string;
  orderDate: string;
  shippedDate?: string;
  shipCity?: string;
  shipCountry?: string;
  totalAmount?: number;
}

const fetchOrders = async (): Promise<Order[]> => {
  const { data } = await apiClient.get("orders");
  return Array.isArray(data) ? data : data.$values ?? data.data ?? [];
};

export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });
};
