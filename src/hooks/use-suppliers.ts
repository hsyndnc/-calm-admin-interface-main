import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface Supplier {
  userId: string;
  fullName: string;
  email: string;
  company: string;
  isApproved: boolean;
  createdAt?: string;
}

const normalizeList = (data: unknown): Supplier[] => {
  if (Array.isArray(data)) return data as Supplier[];
  const d = data as Record<string, unknown>;
  if (d?.$values) return d.$values as Supplier[];
  if (d?.items) {
    const items = d.items as unknown;
    if (Array.isArray(items)) return items as Supplier[];
    if ((items as Record<string, unknown>)?.$values)
      return (items as Record<string, unknown>).$values as Supplier[];
  }
  return [];
};

export const useSuppliers = () => {
  return useQuery<Supplier[]>({
    queryKey: ["admin-suppliers"],
    queryFn: async () => {
      const { data } = await apiClient.get("api/suppliers");
      return normalizeList(data);
    },
  });
};

export const useApproveSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.patch(`api/admin/suppliers/${userId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Supplier, "userId" | "isApproved">) =>
      apiClient.post("api/suppliers", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiClient.delete(`api/suppliers/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
    },
  });
};
