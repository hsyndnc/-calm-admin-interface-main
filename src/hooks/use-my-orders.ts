import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { PagedResult } from "@/lib/types";

export interface MyOrder {
  orderId: number;
  orderDate: string;
  shippedDate?: string;
  shipAddress?: string;
  shipCity?: string;
  shipCountry?: string;
  totalAmount?: number;
  status?: string;
}

export interface CreateOrderPayload {
  shipAddress: string;
  shipCity: string;
  shipCountry: string;
  shipName?: string;
  items: { productId: number; quantity: number; unitPrice: number; discount: number }[];
}

const normalizeList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  const d = data as Record<string, unknown>;
  if (d?.$values) return d.$values as T[];
  if (d?.items) {
    const items = d.items as Record<string, unknown>;
    if (Array.isArray(items)) return items as T[];
    if (items.$values) return items.$values as T[];
  }
  return [];
};

export const useMyOrders = (pageNumber = 1, pageSize = 10) => {
  return useQuery<PagedResult<MyOrder>>({
    queryKey: ["my-orders", pageNumber, pageSize],
    queryFn: async () => {
      const { data } = await apiClient.get("api/orders/my", {
        params: { pageNumber, pageSize },
      });
      if (Array.isArray(data)) {
        return {
          items: data,
          pageNumber: 1,
          pageSize: data.length,
          totalCount: data.length,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        };
      }
      const result = data.$values ? { ...data, items: data.$values } : data;
      if (result.items?.$values) result.items = result.items.$values;
      return result;
    },
    placeholderData: keepPreviousData,
  });
};

export const useOrderById = (id: number | null) => {
  return useQuery<MyOrder & { details?: unknown[] }>({
    queryKey: ["my-order", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`api/orders/${id}`);
      if (data?.details) {
        data.details = normalizeList(data.details);
      }
      return data;
    },
    enabled: id !== null,
  });
};

export const useCreateMyOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) =>
      apiClient.post("api/orders", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};
