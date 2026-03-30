import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { PagedResult } from "@/lib/types";
import type { Product, ProductPayload } from "@/hooks/use-products";

const normalizeList = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  const d = data as Record<string, unknown>;
  if (d?.$values) return d.$values as T[];
  if (d?.items) {
    const items = d.items as unknown;
    if (Array.isArray(items)) return items as T[];
    if ((items as Record<string, unknown>)?.$values)
      return (items as Record<string, unknown>).$values as T[];
  }
  return [];
};

// --- Supplier Products ---

export const useSupplierProducts = (pageNumber = 1, pageSize = 10) => {
  return useQuery<PagedResult<Product>>({
    queryKey: ["supplier-products", pageNumber, pageSize],
    queryFn: async () => {
      const { data } = await apiClient.get("api/supplier/products", {
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

export const useCreateSupplierProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) =>
      apiClient.post("api/supplier/products", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] });
    },
  });
};

export const useUpdateSupplierProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) =>
      apiClient.put(`api/supplier/products/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] });
    },
  });
};

export const useDeleteSupplierProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiClient.delete(`api/supplier/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] });
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      apiClient.patch(`api/supplier/products/${id}/stock`, { stock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] });
    },
  });
};

// --- Supplier Orders ---

export interface SupplierOrder {
  orderId: number;
  orderDate: string;
  customerName?: string;
  totalAmount?: number;
  status?: string;
}

export const useSupplierOrders = (pageNumber = 1, pageSize = 10) => {
  return useQuery<PagedResult<SupplierOrder>>({
    queryKey: ["supplier-orders", pageNumber, pageSize],
    queryFn: async () => {
      const { data } = await apiClient.get("api/supplier/orders", {
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

// --- Supplier Dashboard Stats ---

export interface SupplierStats {
  totalProducts: number;
  totalOrders: number;
  lowStockProducts: Product[];
}

export const useSupplierStats = () => {
  return useQuery<SupplierStats>({
    queryKey: ["supplier-stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("api/supplier/dashboard");
      return {
        totalProducts: data.totalProducts ?? 0,
        totalOrders: data.totalOrders ?? 0,
        lowStockProducts: normalizeList<Product>(data.lowStockProducts),
      };
    },
  });
};
