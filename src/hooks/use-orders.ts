import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { PagedResult } from "@/lib/types";

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

export type OrderPayload = Omit<Order, "orderId" | "customerName">;

const fetchOrders = async (
  pageNumber: number,
  pageSize: number,
): Promise<PagedResult<Order>> => {
  const { data } = await apiClient.get("api/orders", {
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
};

export const useOrders = (pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["orders", pageNumber, pageSize],
    queryFn: () => fetchOrders(pageNumber, pageSize),
    placeholderData: keepPreviousData,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderPayload) =>
      apiClient.post("api/orders", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      original,
      payload,
    }: {
      original: Order;
      payload: OrderPayload;
    }) =>
      apiClient.put(`api/orders/${original.orderId}`, {
        ...original,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`api/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
