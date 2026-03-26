import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { PagedResult } from "@/lib/types";

export interface Order {
  orderId: number;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  orderDate: string;
  requiredDate?: string;
  shippedDate?: string;
  shipVia?: number;
  freight?: number;
  shipName?: string;
  shipAddress?: string;
  shipCity?: string;
  shipCountry?: string;
  totalAmount?: number;
}

export type OrderPayload = Omit<Order, "orderId" | "customerName">;

export interface OrderDetail {
  orderDetailId?: number;
  orderId: number;
  productId: number;
  productName?: string;
  unitPrice: number;
  quantity: number;
  discount: number;
}

export type OrderDetailPayload = Omit<OrderDetail, "orderDetailId" | "productName">;

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

// --- Order Details ---

const fetchOrderDetails = async (orderId: number): Promise<OrderDetail[]> => {
  const { data } = await apiClient.get(`api/orders/${orderId}/details`);
  if (Array.isArray(data)) return data;
  if (data?.$values) return data.$values;
  return [];
};

export const useOrderDetails = (orderId: number | null) => {
  return useQuery({
    queryKey: ["orderDetails", orderId],
    queryFn: () => fetchOrderDetails(orderId!),
    enabled: orderId !== null,
  });
};

export const useCreateOrderDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderDetailPayload) =>
      apiClient.post(`api/orders/${payload.orderId}/details`, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orderDetails", variables.orderId] });
    },
  });
};

export const useUpdateOrderDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: OrderDetailPayload }) =>
      apiClient.put(`api/orders/${payload.orderId}/details/${id}`, { orderDetailId: id, ...payload }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orderDetails", variables.payload.orderId] });
    },
  });
};

export const useDeleteOrderDetail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, orderId }: { id: number; orderId: number }) =>
      apiClient.delete(`api/orders/${orderId}/details/${id}`),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orderDetails", variables.orderId] });
    },
  });
};

// --- Invoice ---

export interface InvoiceResponse {
  success: boolean;
  invoiceId?: number;
  invoiceNumber?: string;
  downloadUrl?: string;
  error?: string;
}

const fetchInvoice = async (orderId: number): Promise<InvoiceResponse> => {
  const { data } = await apiClient.get(`invoice/by-order/${orderId}`);
  return data;
};

export const useInvoice = (orderId: number | null) => {
  return useQuery({
    queryKey: ["invoice", orderId],
    queryFn: () => fetchInvoice(orderId!),
    enabled: orderId !== null,
  });
};

const fetchInvoicePdf = async (downloadUrl: string): Promise<string> => {
  const pdfPath = downloadUrl.replace(/^\/api\/invoice/, "/invoice");
  const { data } = await apiClient.get(pdfPath, { responseType: "blob" });
  return URL.createObjectURL(data);
};

export const useInvoicePdf = (downloadUrl: string | null | undefined) => {
  return useQuery({
    queryKey: ["invoicePdf", downloadUrl],
    queryFn: () => fetchInvoicePdf(downloadUrl!),
    enabled: !!downloadUrl,
  });
};
